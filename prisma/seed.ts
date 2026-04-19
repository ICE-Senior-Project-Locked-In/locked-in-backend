import { PrismaClient, ItemType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Canonical catalog seed for the `Item` table.
 *
 * `code` is the stable identifier shared with the Flutter client
 * (`lib/utils/decoration_sprites.dart` → `DecorationSprite.id`) so the
 * sprite atlas, purchase flow, and backend row all key off the same string.
 * `itemId` stays a generated UUID — callers resolve `code → itemId` via a
 * lookup on POST /inventory.
 *
 * Ordering and prices mirror the frontend catalog (200, 250, …, 1050 in +50
 * steps). Room decorations only; add PET_FOOD entries here when the food
 * flow comes online.
 */
type SeedItem = {
    code: string;
    name: string;
    price: number;
    type: ItemType;
    description?: string;
};

const roomDecor: SeedItem[] = [
    { code: "decor_ball", name: "Ball", price: 200, type: ItemType.ROOM_DECOR },
    { code: "decor_bed", name: "Cat Bed", price: 225, type: ItemType.ROOM_DECOR },
    { code: "decor_bowl", name: "Bowl", price: 250, type: ItemType.ROOM_DECOR },
    { code: "decor_carpet", name: "Carpet", price: 275, type: ItemType.ROOM_DECOR },
    { code: "decor_cat_food", name: "Cat Food", price: 300, type: ItemType.ROOM_DECOR },
    { code: "decor_chair", name: "Chair", price: 325, type: ItemType.ROOM_DECOR },
    { code: "decor_lamp", name: "Lamp", price: 350, type: ItemType.ROOM_DECOR },
    { code: "decor_mouse", name: "Mouse Toy", price: 375, type: ItemType.ROOM_DECOR },
    { code: "decor_plant_large", name: "Large Plant", price: 400, type: ItemType.ROOM_DECOR },
    { code: "decor_plant_medium", name: "Medium Plant", price: 425, type: ItemType.ROOM_DECOR },
    { code: "decor_plant_small", name: "Small Plant", price: 450, type: ItemType.ROOM_DECOR },
    { code: "decor_poster", name: "Poster", price: 475, type: ItemType.ROOM_DECOR },
    { code: "decor_scratcher", name: "Scratcher", price: 500, type: ItemType.ROOM_DECOR },
    { code: "decor_tower_circle", name: "Circle Tower", price: 525, type: ItemType.ROOM_DECOR },
    { code: "decor_tower_square", name: "Square Tower", price: 550, type: ItemType.ROOM_DECOR },
    { code: "decor_window_curtain", name: "Curtains", price: 575, type: ItemType.ROOM_DECOR },
    { code: "decor_window_large", name: "Large Window", price: 600, type: ItemType.ROOM_DECOR },
    { code: "decor_window_small", name: "Small Window", price: 600, type: ItemType.ROOM_DECOR },
];

async function seed() {
    let created = 0;
    let updated = 0;
    for (const item of roomDecor) {
        const existing = await prisma.item.findUnique({
            where: { code: item.code },
        });
        await prisma.item.upsert({
            where: { code: item.code },
            // Only `name`, `price`, `type`, `description` drift between
            // runs — `code` is the stable key so it never changes here.
            update: {
                name: item.name,
                price: item.price,
                type: item.type,
                description: item.description ?? null,
            },
            create: {
                code: item.code,
                name: item.name,
                price: item.price,
                type: item.type,
                description: item.description,
            },
        });
        if (existing) updated += 1;
        else created += 1;
    }
    console.log(`Seeded ${roomDecor.length} items (${created} created, ${updated} updated).`);
}

seed()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
