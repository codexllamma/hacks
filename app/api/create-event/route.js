import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { name, groupId, selectedUserIds, categories } = await req.json()

    // 1. Calculate Total Budget Goal
    const totalBudget = categories.reduce((sum, cat) => {
        return sum + (parseFloat(cat.spendingLimit) || 0);
    }, 0);

    const newEvent = await prisma.event.create({
      data: {
        name: name,
        groupId: groupId,
        budgetGoal: totalBudget, // <--- SAVING THE CALCULATED GOAL

        participants: {
          create: selectedUserIds.map((userId) => ({
            userId: userId,
            role: "PARTICIPANT"
          })),
        },

        categories: {
          create: categories.map((cat) => ({
            name: cat.name,
            spendingLimit: cat.spendingLimit, 
            ruleType: "EQUAL_SPLIT",
            members: {
                create: (cat.memberIds || []).map((memberId) => ({
                    userId: memberId
                }))
            }
          })),
        },
      },
      include: {
        participants: true,
        categories: {
            include: { members: true }
        }, 
      },
    })

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error("Create Event Error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}