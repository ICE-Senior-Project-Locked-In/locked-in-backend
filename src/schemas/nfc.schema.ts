import { z } from "zod";

export class NFCValidation {
    static readonly serialNumberSchema = z.string().min(1, "Serial number is required");
}

export const nfcSchema = z.object({
    deviceId: z.uuid(),
    userId: z.uuid(),
    serialNumber: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date(),
})

export type NFCData = z.infer<typeof nfcSchema>;

export const pairNFCSchema = z.object({
    serialNumber: NFCValidation.serialNumberSchema
});
export type PairNFCData = z.infer<typeof pairNFCSchema>;