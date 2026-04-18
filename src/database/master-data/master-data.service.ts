import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MasterDataService implements OnModuleInit {
    private masterUnblockActionIds: string[] = [];

    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        await this.loadDefaults();
    }

    private async loadDefaults() {
        this.masterUnblockActionIds = (
            await this.prisma.unblockAction.findMany({
                where: { isDefault: true },
                select: { actionId: true },
            })
        ).map(a => a.actionId);
    }

    getUnblockActionIds() {
        return this.masterUnblockActionIds;
    }
}
