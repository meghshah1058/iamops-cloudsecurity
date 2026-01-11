import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all findings from user's audits
    const findings = await prisma.finding.findMany({
      where: {
        audit: {
          account: {
            userId: user.id,
          },
        },
      },
      orderBy: [
        { severity: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        findingId: true,
        severity: true,
        title: true,
        description: true,
        resource: true,
        resourceArn: true,
        region: true,
        recommendation: true,
        status: true,
        createdAt: true,
        audit: {
          select: {
            account: {
              select: {
                name: true,
                accountId: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ findings });
  } catch (error) {
    console.error("Findings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
