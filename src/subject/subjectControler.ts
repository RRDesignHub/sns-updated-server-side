import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { ClassSubject, SubjectMaster } from "./subjectModel";

// Get all subjects (with optional filtering)
const getAllSubjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, search } = req.query;

    let filter: any = {};
    if (status) filter.status = status;

    let query = SubjectMaster.find(filter);

    if (search) {
      query = query.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { nameBn: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ],
      });
    }

    const subjects = await query.sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error: any) {
    return next(createHttpError(500, error.message));
  }
};

// Create a new subject
const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, nameBn, code, totalMarks, academicMarks, behavioralMarks } =
      req.body;

    // Check if subject code already exists
    const existingSubject = await SubjectMaster.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "এই কোডের একটি বিষয় ইতিমধ্যে রয়েছে",
      });
    }

    const subject = new SubjectMaster({
      name,
      nameBn,
      code: code.toUpperCase(),
      totalMarks,
      academicMarks,
      behavioralMarks,
    });

    await subject.save();

    res.status(201).json({
      success: true,
      message: "বিষয়টি সফলভাবে তৈরি করা হয়েছে",
      data: subject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "সার্ভার সমস্যা হয়েছে",
    });
  }
};

// Get single subject by ID
const getSubjectById = async (req: Request, res: Response) => {
  try {
    const subject = await SubjectMaster.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "বিষয়টি পাওয়া যায়নি",
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update subject
const updateSubject = async (req: Request, res: Response) => {
  try {
    const subject = await SubjectMaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "বিষয়টি পাওয়া যায়নি",
      });
    }

    res.status(200).json({
      success: true,
      message: "বিষয়টি হালনাগাদ করা হয়েছে",
      data: subject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete subject (soft delete - just change status)
const deleteSubject = async (req: Request, res: Response) => {
  try {
    // Check if subject is used in any class
    const isUsed = await ClassSubject.findOne({
      "subjects.subjectId": req.params.id,
    });

    if (isUsed) {
      return res.status(400).json({
        success: false,
        message: "এই বিষয়টি একটি শ্রেণিতে ব্যবহৃত হচ্ছে, তাই মুছা যাচ্ছে না",
      });
    }

    const subject = await SubjectMaster.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "বিষয়টি পাওয়া যায়নি",
      });
    }

    res.status(200).json({
      success: true,
      message: "বিষয়টি মুছে ফেলা হয়েছে",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== CLASS SUBJECT ASSIGNMENT APIs ====================

// Get all class subject configurations
const getAllClassSubjects = async (req: Request, res: Response) => {
  try {
    const classConfigs = await ClassSubject.find(filter)
      .populate("subjects.subjectId")
      .sort({ className: 1 });

    res.status(200).json({
      success: true,
      data: classConfigs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single class subject configuration by class ID
const getClassSubjectsByClassId = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    const query: any = { classId };
    if (academicYear) query.academicYear = academicYear;

    const classConfig =
      await ClassSubject.findOne(query).populate("subjects.subjectId");

    if (!classConfig) {
      return res.status(404).json({
        success: false,
        message: "এই ক্লাসের জন্য কোন বিষয় নির্ধারণ করা হয়নি",
      });
    }

    res.status(200).json({
      success: true,
      data: classConfig,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Assign subjects to a class (Create or Update)
const assignSubjectsToClass = async (req: Request, res: Response) => {
  try {
    const { classId, className, section, academicYear, subjects, group } =
      req.body;

    // Validate required fields
    if (!classId || !className || !section || !academicYear || !subjects) {
      return res.status(400).json({
        success: false,
        message: "সকল প্রয়োজনীয় তথ্য দিন",
      });
    }

    // Validate all subject IDs exist
    for (const subjectItem of subjects) {
      const subjectExists = await SubjectMaster.findById(subjectItem.subjectId);
      if (!subjectExists) {
        return res.status(400).json({
          success: false,
          message: `বিষয়টি পাওয়া যায়নি: ${subjectItem.subjectId}`,
        });
      }
    }

    // Check if configuration already exists
    let classConfig = await ClassSubject.findOne({ classId, academicYear });

    if (classConfig) {
      // Update existing configuration
      classConfig.className = className;
      classConfig.section = section;
      if (group) classConfig.group = group;
      classConfig.subjects = subjects;
      classConfig.updatedAt = new Date();

      await classConfig.save();

      res.status(200).json({
        success: true,
        message: "ক্লাসের বিষয় হালনাগাদ করা হয়েছে",
        data: classConfig,
      });
    } else {
      // Create new configuration
      classConfig = new ClassSubject({
        classId,
        className,
        section,
        academicYear,
        group: group || null,
        subjects,
      });

      await classConfig.save();

      res.status(201).json({
        success: true,
        message: "ক্লাসের বিষয় নির্ধারণ করা হয়েছে",
        data: classConfig,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update class subject configuration
const updateClassSubjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subjects, className, section, group } = req.body;

    const classConfig = await ClassSubject.findById(id);

    if (!classConfig) {
      return res.status(404).json({
        success: false,
        message: "কনফিগারেশনটি পাওয়া যায়নি",
      });
    }

    if (subjects) {
      // Validate subject IDs
      for (const subjectItem of subjects) {
        const subjectExists = await SubjectMaster.findById(
          subjectItem.subjectId,
        );
        if (!subjectExists) {
          return res.status(400).json({
            success: false,
            message: `বিষয়টি পাওয়া যায়নি: ${subjectItem.subjectId}`,
          });
        }
      }
      classConfig.subjects = subjects;
    }

    if (className) classConfig.className = className;
    if (section) classConfig.section = section;
    if (group !== undefined) classConfig.group = group;
    classConfig.updatedAt = new Date();

    await classConfig.save();

    res.status(200).json({
      success: true,
      message: "ক্লাসের বিষয় হালনাগাদ করা হয়েছে",
      data: classConfig,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete class subject configuration
const deleteClassSubjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const classConfig = await ClassSubject.findByIdAndDelete(id);

    if (!classConfig) {
      return res.status(404).json({
        success: false,
        message: "কনফিগারেশনটি পাওয়া যায়নি",
      });
    }

    res.status(200).json({
      success: true,
      message: "ক্লাসের বিষয় কনফিগারেশন মুছে ফেলা হয়েছে",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get available subjects for a class (subjects not already assigned)
const getAvailableSubjectsForClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    // Get currently assigned subjects for this class
    const classConfig = await ClassSubject.findOne({
      classId,
      academicYear: academicYear || new Date().getFullYear().toString(),
    });

    const assignedSubjectIds = classConfig
      ? classConfig.subjects.map((s) => s.subjectId.toString())
      : [];

    // Get all active subjects
    const allSubjects = await SubjectMaster.find({ status: "active" });

    // Filter out assigned subjects
    const availableSubjects = allSubjects.filter(
      (subject) => !assignedSubjectIds.includes(subject._id.toString()),
    );

    res.status(200).json({
      success: true,
      data: {
        assigned: classConfig || null,
        available: availableSubjects,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update subject order within a class
const updateSubjectOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subjects } = req.body; // Array of { subjectId, order }

    const classConfig = await ClassSubject.findById(id);

    if (!classConfig) {
      return res.status(404).json({
        success: false,
        message: "কনফিগারেশনটি পাওয়া যায়নি",
      });
    }

    // Update order for each subject
    for (const item of subjects) {
      const subject = classConfig.subjects.find(
        (s) => s.subjectId.toString() === item.subjectId,
      );
      if (subject) {
        subject.order = item.order;
      }
    }

    // Sort subjects by order
    classConfig.subjects.sort((a, b) => a.order - b.order);
    classConfig.updatedAt = new Date();

    await classConfig.save();

    res.status(200).json({
      success: true,
      message: "বিষয়ের ক্রম হালনাগাদ করা হয়েছে",
      data: classConfig,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle subject active status within a class
const toggleSubjectStatus = async (req: Request, res: Response) => {
  try {
    const { id, subjectId } = req.params;

    const classConfig = await ClassSubject.findById(id);

    if (!classConfig) {
      return res.status(404).json({
        success: false,
        message: "কনফিগারেশনটি পাওয়া যায়নি",
      });
    }

    const subject = classConfig.subjects.find(
      (s) => s.subjectId.toString() === subjectId,
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "বিষয়টি কনফিগারেশনে পাওয়া যায়নি",
      });
    }

    subject.isActive = !subject.isActive;
    classConfig.updatedAt = new Date();
    await classConfig.save();

    res.status(200).json({
      success: true,
      message: subject.isActive
        ? "বিষয়টি সক্রিয় করা হয়েছে"
        : "বিষয়টি নিষ্ক্রিয় করা হয়েছে",
      data: classConfig,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getAllSubjects,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getAllClassSubjects,
  getClassSubjectsByClassId,
  assignSubjectsToClass,
  updateClassSubjects,
  deleteClassSubjects,
  getAvailableSubjectsForClass,
  updateSubjectOrder,
  toggleSubjectStatus,
};
