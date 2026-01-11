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

    const finding = await prisma.finding.findFirst({
      where: {
        id,
        audit: {
          account: {
            userId: user.id,
          },
        },
      },
      include: {
        audit: {
          include: {
            account: true,
          },
        },
        phase: true,
      },
    });

    if (!finding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    return NextResponse.json({ finding });
  } catch (error) {
    console.error("Finding API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Verify the finding belongs to the user
    const existingFinding = await prisma.finding.findFirst({
      where: {
        id,
        audit: {
          account: {
            userId: user.id,
          },
        },
      },
    });

    if (!existingFinding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["open", "resolved", "ignored"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const finding = await prisma.finding.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ finding });
  } catch (error) {
    console.error("Finding update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
