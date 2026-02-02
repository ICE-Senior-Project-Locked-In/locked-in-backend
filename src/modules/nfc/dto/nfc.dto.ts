import { createZodDto } from "nestjs-zod";
import { pairNFCSchema, nfcResponseSchema } from "@/schemas/nfc.schema";

export class NFCResponseDto extends createZodDto(nfcResponseSchema) { }
export class PairNFCDto extends createZodDto(pairNFCSchema) { }