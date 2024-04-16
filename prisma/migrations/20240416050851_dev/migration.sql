/*
  Warnings:

  - A unique constraint covering the columns `[appointmentId]` on the table `doctor_schedules` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctorSchedulesDoctorId_doctorSchedulesSchedu_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedules_appointmentId_key" ON "doctor_schedules"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
