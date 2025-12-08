import { Router } from "express";
import { storage } from "../storage";
import { apiKeyMiddleware } from "../auth";

const router = Router();
router.use(apiKeyMiddleware);

/**
 * Sanitize and validate input string
 */
function validateString(value: any, fieldName: string, minLength: number = 1, maxLength: number = 255): string {
    if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
    }
    const trimmed = value.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) {
        throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
    }
    return trimmed;
}

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// List all students
router.get("/students", async (req, res) => {
    try {
        const tenantId = (req as any).tenantId;
        const students = await storage.listStudents(tenantId);
        res.json(students);
    } catch (error) {
        console.error("Failed to fetch students:", error);
        res.status(500).json({ message: "Failed to fetch students" });
    }
});

// Get single student
router.get("/students/:id", async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Validate ID format to prevent injection
        if (!/^[a-zA-Z0-9\-_]+$/.test(studentId)) {
            return res.status(400).json({ message: "Invalid student ID format" });
        }
        
        const student = await storage.getStudent(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json(student);
    } catch (error) {
        console.error("Failed to fetch student:", error);
        res.status(500).json({ message: "Failed to fetch student" });
    }
});

// Create student
router.post("/students", async (req, res) => {
    try {
        const tenantId = (req as any).tenantId;
        const { name, email, studentId, program, enrollmentYear, status } = req.body;

        // Validate required fields
        if (!name || !email || !studentId) {
            return res.status(400).json({ message: "Name, email, and studentId are required" });
        }

        // Validate and sanitize inputs
        let validatedName: string;
        let validatedEmail: string;
        let validatedStudentId: string;
        let validatedProgram: string;
        let validatedStatus: string;

        try {
            validatedName = validateString(name, "Name", 2, 100);
            validatedEmail = validateString(email, "Email", 5, 255);
            validatedStudentId = validateString(studentId, "StudentId", 1, 50);
            
            if (!validateEmail(validatedEmail)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            
            validatedProgram = program ? validateString(program, "Program", 0, 100) : "";
            validatedStatus = status ? validateString(status, "Status", 0, 50) : "Active";
        } catch (validationError: any) {
            return res.status(400).json({ message: validationError.message });
        }

        // Validate enrollment year
        let validatedYear = enrollmentYear || new Date().getFullYear().toString();
        if (typeof validatedYear === 'number') {
            validatedYear = validatedYear.toString();
        }
        if (!/^\d{4}$/.test(validatedYear)) {
            return res.status(400).json({ message: "Invalid enrollment year format" });
        }

        const student = await storage.createStudent({
            tenantId,
            name: validatedName,
            email: validatedEmail,
            studentId: validatedStudentId,
            program: validatedProgram,
            enrollmentYear: validatedYear,
            status: validatedStatus
        });

        res.status(201).json(student);
    } catch (error) {
        console.error("Failed to create student:", error);
        res.status(500).json({ message: "Failed to create student" });
    }
});

// Bulk import students from CSV data
router.post("/students/import", async (req, res) => {
    try {
        const tenantId = (req as any).tenantId;
        const { students: studentsData } = req.body;

        if (!Array.isArray(studentsData) || studentsData.length === 0) {
            return res.status(400).json({ message: "Invalid students data" });
        }

        // Limit bulk import size to prevent DoS
        if (studentsData.length > 1000) {
            return res.status(400).json({ message: "Maximum 1000 students can be imported at once" });
        }

        const studentsToCreate = studentsData.map((s: any, index: number) => {
            try {
                const validatedName = validateString(s.name, `Student ${index + 1} name`, 2, 100);
                const validatedEmail = validateString(s.email, `Student ${index + 1} email`, 5, 255);
                const validatedStudentId = validateString(s.studentId, `Student ${index + 1} studentId`, 1, 50);
                
                if (!validateEmail(validatedEmail)) {
                    throw new Error(`Invalid email format for student ${index + 1}`);
                }
                
                const validatedProgram = s.credentialType || s.program ? 
                    validateString(s.credentialType || s.program, `Student ${index + 1} program`, 0, 100) : "";
                
                let validatedYear = s.enrollmentYear || new Date().getFullYear().toString();
                if (typeof validatedYear === 'number') {
                    validatedYear = validatedYear.toString();
                }
                
                return {
                    tenantId,
                    name: validatedName,
                    email: validatedEmail,
                    studentId: validatedStudentId,
                    program: validatedProgram,
                    enrollmentYear: validatedYear,
                    status: "Active" as const
                };
            } catch (validationError: any) {
                throw new Error(`Validation failed for student ${index + 1}: ${validationError.message}`);
            }
        });

        const created = await storage.bulkCreateStudents(studentsToCreate);
        res.status(201).json({
            message: `Successfully imported ${created.length} students`,
            count: created.length,
            students: created
        });
    } catch (error: any) {
        console.error("Failed to import students:", error);
        res.status(500).json({ message: error.message || "Failed to import students" });
    }
});

// Update student
router.put("/students/:id", async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Validate ID format
        if (!/^[a-zA-Z0-9\-_]+$/.test(studentId)) {
            return res.status(400).json({ message: "Invalid student ID format" });
        }

        // Validate update data
        const updateData: any = {};
        
        if (req.body.name !== undefined) {
            updateData.name = validateString(req.body.name, "Name", 2, 100);
        }
        if (req.body.email !== undefined) {
            updateData.email = validateString(req.body.email, "Email", 5, 255);
            if (!validateEmail(updateData.email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
        }
        if (req.body.program !== undefined) {
            updateData.program = validateString(req.body.program, "Program", 0, 100);
        }
        if (req.body.status !== undefined) {
            updateData.status = validateString(req.body.status, "Status", 0, 50);
        }
        if (req.body.enrollmentYear !== undefined) {
            let year = req.body.enrollmentYear.toString();
            if (!/^\d{4}$/.test(year)) {
                return res.status(400).json({ message: "Invalid enrollment year format" });
            }
            updateData.enrollmentYear = year;
        }

        const updated = await storage.updateStudent(studentId, updateData);
        if (!updated) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json(updated);
    } catch (error: any) {
        console.error("Failed to update student:", error);
        res.status(500).json({ message: "Failed to update student" });
    }
});

// Delete student
router.delete("/students/:id", async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Validate ID format
        if (!/^[a-zA-Z0-9\-_]+$/.test(studentId)) {
            return res.status(400).json({ message: "Invalid student ID format" });
        }
        
        const deleted = await storage.deleteStudent(studentId);
        if (!deleted) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Failed to delete student:", error);
        res.status(500).json({ message: "Failed to delete student" });
    }
});

export default router;
