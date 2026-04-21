import { PrismaClient, type Item, ItemType } from "@prisma/client";
import { confirmDatabase } from "./utils";

const prisma = new PrismaClient();

const items: Omit<Item, "itemId" | "description" | "createdAt" | "updatedAt">[] = [
    { name: "Ball", price: 200, type: ItemType.ROOM_DECOR },
    { name: "Cat Bed", price: 225, type: ItemType.ROOM_DECOR },
    { name: "Bowl", price: 250, type: ItemType.ROOM_DECOR },
    { name: "Carpet", price: 275, type: ItemType.ROOM_DECOR },
    { name: "Cat Food", price: 300, type: ItemType.ROOM_DECOR },
    { name: "Chair", price: 325, type: ItemType.ROOM_DECOR },
    { name: "Lamp", price: 350, type: ItemType.ROOM_DECOR },
    { name: "Mouse Toy", price: 375, type: ItemType.ROOM_DECOR },
    { name: "Large Plant", price: 400, type: ItemType.ROOM_DECOR },
    { name: "Medium Plant", price: 425, type: ItemType.ROOM_DECOR },
    { name: "Small Plant", price: 450, type: ItemType.ROOM_DECOR },
    { name: "Poster", price: 475, type: ItemType.ROOM_DECOR },
    { name: "Scratcher", price: 500, type: ItemType.ROOM_DECOR },
    { name: "Circle Tower", price: 525, type: ItemType.ROOM_DECOR },
    { name: "Square Tower", price: 550, type: ItemType.ROOM_DECOR },
    { name: "Curtains", price: 575, type: ItemType.ROOM_DECOR },
    { name: "Large Window", price: 600, type: ItemType.ROOM_DECOR },
    { name: "Small Window", price: 600, type: ItemType.ROOM_DECOR },
] as const;


async function seedItems() {
    try {
        for (const item of items) {
            const existingItem = await prisma.item.findUnique({
                where: { name: item.name },
            });

            if (existingItem) {
                console.log(`Item '${item.name}' already exists. Skipping.`);
                continue;
            }

            await prisma.item.create({
                data: item,
            });

            console.log(`Item '${item.name}' created successfully.`);
        }
    } catch (error) {
        console.error("Error seeding items:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    await confirmDatabase("Seed items");
    await seedItems();
}

main();