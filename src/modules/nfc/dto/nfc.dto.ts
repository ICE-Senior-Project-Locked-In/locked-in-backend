import { createZodDto } from "nestjs-zod";
import { pairNFCSchema } from "@/schemas/nfc.schema";

export class PairNFCDto extends createZodDto(pairNFCSchema) { }