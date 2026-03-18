import { PrismaService } from "@/database/prisma.service";
import { PairNFCData } from "@/schemas/nfc.schema";
import { NFCService } from "./nfc.service";

describe("NFCService", () => {
    let service: NFCService;

    const nfcDeviceMock = {
        create: jest.fn(),
        delete: jest.fn(),
    };

    const prismaServiceMock = {
        nFCDevice: nfcDeviceMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new NFCService(prismaServiceMock);
    });

    it("should pair an NFC device for user", async () => {
        const userId = "user-1";
        const data: PairNFCData = { serialNumber: "SN-123456" };
        const createdDevice = {
            deviceId: "device-1",
            userId,
            serialNumber: data.serialNumber,
        };

        nfcDeviceMock.create.mockResolvedValue(createdDevice);

        const result = await service.pair(userId, data);

        expect(nfcDeviceMock.create).toHaveBeenCalledWith({
            data: {
                userId,
                serialNumber: data.serialNumber,
            },
        });
        expect(result).toBe(createdDevice);
    });

    it("should unpair NFC device by user id", async () => {
        const userId = "user-1";
        const deletedDevice = {
            deviceId: "device-1",
            userId,
            serialNumber: "SN-123456",
        };

        nfcDeviceMock.delete.mockResolvedValue(deletedDevice);

        const result = await service.unpair(userId);

        expect(nfcDeviceMock.delete).toHaveBeenCalledWith({
            where: { userId },
        });
        expect(result).toBe(deletedDevice);
    });
});
