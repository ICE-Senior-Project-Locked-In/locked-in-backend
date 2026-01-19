import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createTestUser() {
    const email = "admin@li.com";
    const password = "admin123";
    const name = "Locked In Admin";

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log("Test user already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        console.log("Test user created successfully:");
        console.log("Email:", user.email);
        console.log("Name:", user.name);
        console.log("User ID:", user.userId);
    } catch (error) {
        console.error("Error creating test user:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();