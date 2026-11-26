export interface Student {
  _id?: string;
  studentID: string; // Server generated: SN-2025-0001
  section: "primary" | "higher";
  className: string;
  classRoll: string;
  groupName?: string;
  sectionName?: string;
  session: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  mobileNo: number;
  birthRegNo?: string;
  dateOfBirth: string;
  address?: string;
  gender: "Male" | "Female";
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  religion: "Islam" | "Hindu" | "Christian" | "Buddhist";
  image?: string;
  admissionFee: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
