import { NextResponse } from 'next/server'
import prisma from "../../../lib/prisma"; // Fixed: 3 levels up

export async function POST(req) {
  try {
    const { name, groupId, selectedUserIds, categories } = await req.json()

    const newEvent = await prisma.event.create({
      data: {
        name: name,
        groupId: groupId,
        participants: {
          create: selectedUserIds.map((userId) => ({
            userId: userId,
            role: "PARTICIPANT"
          })),
        },
        categories: {
          create: categories.map((cat) => ({
            name: cat.name,
            spendingLimit: cat.spendingLimit ? parseFloat(cat.spendingLimit) : null,
            ruleType: cat.ruleType || "EQUAL_SPLIT",
          })),
        },
      },
      include: {
        participants: true,
        categories: true, 
      },
    })

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error("Request error", error)
    return NextResponse.json({ error: "Error creating event" }, { status: 500 })
  }
}