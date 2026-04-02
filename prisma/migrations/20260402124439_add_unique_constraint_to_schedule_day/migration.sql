-- DropIndex
DROP INDEX "FocusScheduleDay_scheduleId_idx";

-- CreateIndex
CREATE INDEX "FocusScheduleDay_scheduleId_dayOfWeek_idx" ON "FocusScheduleDay"("scheduleId", "dayOfWeek");
