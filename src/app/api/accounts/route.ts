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

    const accounts = await prisma.awsAccount.findMany({
      where: { userId: user.id },
      include: {
        audits: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            riskScore: true,
            totalFindings: true,
            critical: true,
            high: true,
            medium: true,
            low: true,
            completedAt: true,
          },
        },
        _count: {
          select: { audits: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Accounts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, accountId, region, accessKeyId, secretAccessKey, roleArn } = body;

    if (!name || !accountId) {
      return NextResponse.json(
        { error: "Name and Account ID are required" },
        { status: 400 }
      );
    }

    const account = await prisma.awsAccount.create({
      data: {
        name,
        accountId,
        region: region || "us-east-1",
        accessKeyId,
        secretAccessKey,
        roleArn,
        userId: user.id,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
