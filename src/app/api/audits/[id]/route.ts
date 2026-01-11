import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const audit = await prisma.audit.findFirst({
      where: {
        id,
        account: {
          userId: user.id,
        },
      },
      include: {
        account: {
          select: {
            name: true,
            accountId: true,
          },
        },
        phases: {
          orderBy: { phaseNumber: "asc" },
        },
        findings: {
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
          },
        },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json({ audit });
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
