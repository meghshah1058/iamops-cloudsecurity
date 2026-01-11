import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET all Azure subscriptions for the current user
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

    const subscriptions = await prisma.azureSubscription.findMany({
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

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Azure Subscriptions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new Azure subscription
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
    const { name, subscriptionId, tenantId, clientId, clientSecret, region } = body;

    if (!name || !subscriptionId) {
      return NextResponse.json(
        { error: "Name and Subscription ID are required" },
        { status: 400 }
      );
    }

    // Check if subscription already exists for this user
    const existingSubscription = await prisma.azureSubscription.findUnique({
      where: {
        userId_subscriptionId: {
          userId: user.id,
          subscriptionId,
        },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Subscription already exists" },
        { status: 409 }
      );
    }

    const subscription = await prisma.azureSubscription.create({
      data: {
        name,
        subscriptionId,
        tenantId: tenantId || null,
        clientId: clientId || null,
        clientSecret: clientSecret || null,
        region: region || "eastus",
        userId: user.id,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Azure Subscriptions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
