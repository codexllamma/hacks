import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(req) {
  try {
    const { userId, categoryId, amount } = await req.json();

    // 1. Basic Validation
    if (!userId || !categoryId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 2. Update Expense Category
      // We wrap this first update. If categoryId is wrong, this throws P2025.
      const updatedCategory = await tx.expenseCategory.update({
        where: { id: categoryId },
        data: {
          totalPooled: { increment: parseFloat(amount) } // Ensure amount is a number
        },
        include: { event: true }
      });

      // 3. Update Parent Event Total
      await tx.event.update({
        where: { id: updatedCategory.eventId },
        data: {
          totalPooled: { increment: parseFloat(amount) }
        }
      });

      // 4. Log the Transaction
      await tx.transaction.create({
        data: {
          amount: parseFloat(amount),
          userId: userId,
          eventId: updatedCategory.eventId,
          categoryId: categoryId,
          status: "SUCCESS",
        }
      });

      return updatedCategory;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Deposit error:", error);

    // 5. specific Error Handling for Stale IDs
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Category not found. The database may have been reset. Please refresh the page." }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ error: "Failed to process deposit" }, { status: 500 });
  }
}