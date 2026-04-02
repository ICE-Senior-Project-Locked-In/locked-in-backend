import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class ScheduleValidation {
    static readonly titleSchema = z.string("Schedule title is required").min(1, "Schedule title cannot be empty");
    static readonly typeIdSchema = z.uuid("Schedule type ID is required");
    static readonly iconSchema = z.string("Schedule icon is required").min(1, "Schedule icon cannot be empty").max(1, "Schedule icon must be a single character");
    static readonly startTimeSchema = z.iso.time("Schedule start time is required");
    static readonly endTimeSchema = z.iso.time("Schedule end time is required");
    static readonly timezoneSchema = z.string("Schedule timezone is required").min(1, "Schedule timezone cannot be empty");
    static readonly daysOfWeekSchema = z.array(z.number().int().min(0).max(6)).nonempty("At least one day of the week must be selected").refine(
        (days) => new Set(days).size === days.length, {
        message: "Duplicate days are not allowed",
    });
}

export const scheduleSchema = z.object({
    scheduleId: z.uuid(),
    userId: z.uuid(),
    typeId: z.uuid(),
    title: z.string(),
    icon: z.string().nullable(),
    startTime: z.string(),
    endTime: z.string(),
    timezone: z.string(),
    active: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const scheduleResponseSchema = createApiResponseSchema(scheduleSchema);
export const scheduleListResponseSchema = createApiResponseSchema(z.array(scheduleSchema));

export type ScheduleData = z.infer<typeof scheduleSchema>;
export type ScheduleListData = z.infer<typeof scheduleListResponseSchema>;

export const createScheduleSchema = z.object({
    typeId: ScheduleValidation.typeIdSchema,
    title: ScheduleValidation.titleSchema,
    icon: ScheduleValidation.iconSchema.optional(),
    startTime: ScheduleValidation.startTimeSchema,
    endTime: ScheduleValidation.endTimeSchema,
    timezone: ScheduleValidation.timezoneSchema.optional(),
    daysOfWeek: ScheduleValidation.daysOfWeekSchema,
});

export const updateScheduleSchema = z.object({
    typeId: ScheduleValidation.typeIdSchema.optional(),
    title: ScheduleValidation.titleSchema.optional(),
    icon: ScheduleValidation.iconSchema.optional(),
    startTime: ScheduleValidation.startTimeSchema.optional(),
    endTime: ScheduleValidation.endTimeSchema.optional(),
    timezone: ScheduleValidation.timezoneSchema.optional(),
    daysOfWeek: ScheduleValidation.daysOfWeekSchema.optional(),
});