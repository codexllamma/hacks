import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // Fixed: 4 levels up

export async function POST(req) {
  try {
    const { userId, categoryId, action } = await req.json();

    if (action === "JOIN") {
      await prisma.categoryMember.upsert({
        where: {
          userId_expenseCategoryId: {
            userId: userId,
            expenseCategoryId: categoryId,
          },
        },
        update: {},
        create: {
          userId: userId,
          expenseCategoryId: categoryId,
        },
      });
    } else {
      await prisma.categoryMember.deleteMany({
        where: {
          userId: userId,
          expenseCategoryId: categoryId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Opt-in error:", error);
    return NextResponse.json(
      { error: "Database operation failed", details: error.message },
      { status: 500 }
    );
  }
}