import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MasterDataService implements OnModuleInit {
    private masterUnblockActionIds: string[] = [];
    private masterFocusTypeIds: string[] = [];

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

        this.masterFocusTypeIds = (
            await this.prisma.focusType.findMany({
                where: { isDefault: true },
                select: { typeId: true },
            })
        ).map(t => t.typeId);
    }

    getUnblockActionIds() {
        return this.masterUnblockActionIds;
    }

    getFocusTypeIds() {
        return this.masterFocusTypeIds;
    }
}
