import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const logs = await prisma.transaction.findMany({
      where: { 
          eventId: id 
      },
      include: { 
        user: true,
        ExpenseCategory: true // <--- NEW: Include category details so we know the purpose
      }, 
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Audit Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}