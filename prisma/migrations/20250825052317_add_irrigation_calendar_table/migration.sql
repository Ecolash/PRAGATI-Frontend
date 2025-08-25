-- CreateTable
CREATE TABLE "public"."IrrigationCalendar" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "irrigationDate" TIMESTAMP(3) NOT NULL,
    "areaIrrigated" DOUBLE PRECISION NOT NULL,
    "waterUsed" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IrrigationCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IrrigationCalendar_userId_idx" ON "public"."IrrigationCalendar"("userId");

-- CreateIndex
CREATE INDEX "IrrigationCalendar_irrigationDate_idx" ON "public"."IrrigationCalendar"("irrigationDate");

-- AddForeignKey
ALTER TABLE "public"."IrrigationCalendar" ADD CONSTRAINT "IrrigationCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
