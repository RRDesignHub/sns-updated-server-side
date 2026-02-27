export interface User{
    _id: string;
    name: string;
    email: string;
    password: string;
    role: "admin" | "teacher" | "accountant" | "blocked";
    createdAt: Date;
    updatedAt: Date;
}