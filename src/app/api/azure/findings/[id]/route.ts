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

    const finding = await prisma.azureFinding.findFirst({
      where: {
        id,
        audit: {
          subscription: {
            user: { email: session.user.email },
          },
        },
      },
    });

    if (!finding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    return NextResponse.json({ finding });
  } catch (error) {
    console.error("Azure Finding API error:", error);
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

    const body = await request.json();
    const { status } = body;

    const finding = await prisma.azureFinding.findFirst({
      where: {
        id,
        audit: {
          subscription: {
            user: { email: session.user.email },
          },
        },
      },
    });

    if (!finding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    const updatedFinding = await prisma.azureFinding.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "resolved" ? new Date() : null,
      },
    });

    return NextResponse.json({ finding: updatedFinding });
  } catch (error) {
    console.error("Azure Finding update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
