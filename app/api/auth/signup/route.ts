import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  return NextResponse.redirect(new URL("/signup", process.env.NEXTAUTH_URL));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { fullName, username, aadharNumber, password } = body;

  if (!fullName || !username || !aadharNumber || !password) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const existingUserByUsername = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (existingUserByUsername) {
    return new NextResponse("Username already exists", { status: 400 });
  }

  const existingUserByAadhar = await prisma.user.findUnique({
    where: {
      aadharNumber,
    },
  });

  if (existingUserByAadhar) {
    return new NextResponse("Aadhar number already exists", { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      username,
      aadharNumber,
      password: hashedPassword,
    },
  });

  return NextResponse.json(user);
}
