import { createZodDto } from "nestjs-zod";
import {
    scheduleResponseSchema,
    scheduleListResponseSchema,
    createScheduleSchema,
    updateScheduleSchema,
} from "@/schemas/schedule.schema";

export class ScheduleResponseDto extends createZodDto(scheduleResponseSchema) { }
export class ScheduleListResponseDto extends createZodDto(scheduleListResponseSchema) { }
export class CreateScheduleDto extends createZodDto(createScheduleSchema) { }
export class UpdateScheduleDto extends createZodDto(updateScheduleSchema) { }