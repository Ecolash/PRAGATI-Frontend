/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all irrigation records for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  const records = await prisma.irrigationCalendar.findMany({
    where: { userId: Number(userId) },
    orderBy: { irrigationDate: "desc" },
  });
  return NextResponse.json(records);
}

// POST: Add a new irrigation record
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, irrigationDate, areaIrrigated, waterUsed, notes } = body;
  if (!userId || !irrigationDate || !areaIrrigated || !waterUsed) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  const record = await prisma.irrigationCalendar.create({
    data: {
      userId,
      irrigationDate: new Date(irrigationDate),
      areaIrrigated,
      waterUsed,
      notes,
    },
  });
  return NextResponse.json(record);
}
