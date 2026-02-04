import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  const groupId = "g1"; 

  try {
    // FIX: Query using the explicit 'GroupMember' table relation
    const users = await prisma.user.findMany({
      where: {
        GroupMember: { // <--- Changed from 'groups' to 'GroupMember'
          some: {
            groupId: groupId
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || "Unknown User",
      email: user.email,
      role: "MEMBER",
      joinedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Error fetching group users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users for this group" },
      { status: 500 }
    );
  }
}