import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma"; // Fixed: 3 levels up

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        participants: {
          include: { user: true }
        },
        categories: {
          include: {
            members: true, 
          }
        }, 
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}