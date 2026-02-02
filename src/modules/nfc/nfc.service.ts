import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { PairNFCData } from "@/schemas/nfc.schema";

@Injectable()
export class NFCService {
    constructor(private readonly prismaService: PrismaService) { }

    async pair(userId: string, data: PairNFCData) {
        const { serialNumber } = data;

        return this.prismaService.nFCDevice.create({
            data: {
                userId,
                serialNumber,
            }
        })
    }

    async unpair(userId: string) {
        return this.prismaService.nFCDevice.delete({
            where: { userId }
        })
    }
}