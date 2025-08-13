"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return {
      user: null,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        aadharNumber: true,
        // Don't select password for security
      },
    });

    if (user) {
      return {
        user: JSON.parse(JSON.stringify(user)),
      };
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  return {
    user: null,
  };
}
