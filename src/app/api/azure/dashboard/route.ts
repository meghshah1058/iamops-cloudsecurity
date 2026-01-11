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

    // Get Azure subscriptions
    const subscriptions = await prisma.azureSubscription.findMany({
      where: { userId: user.id, isActive: true },
      select: {
        id: true,
        name: true,
        subscriptionId: true,
        region: true,
        healthScore: true,
        lastScanAt: true,
      },
    });

    // Get latest audit
    const latestAudit = await prisma.azureAudit.findFirst({
      where: {
        subscription: { userId: user.id },
        status: "completed",
      },
      orderBy: { completedAt: "desc" },
      include: {
        subscription: {
          select: { name: true, subscriptionId: true },
        },
        phases: {
          orderBy: { phaseNumber: "asc" },
        },
        findings: {
          orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            findingId: true,
            severity: true,
            title: true,
            description: true,
            resource: true,
            resourceId: true,
            region: true,
            recommendation: true,
            status: true,
          },
        },
      },
    });

    // Get historical audits
    const historicalAudits = await prisma.azureAudit.findMany({
      where: {
        subscription: { userId: user.id },
        status: "completed",
      },
      orderBy: { completedAt: "asc" },
      take: 10,
      select: {
        id: true,
        critical: true,
        high: true,
        medium: true,
        low: true,
        completedAt: true,
      },
    });

    const stats = latestAudit
      ? {
          totalFindings: latestAudit.totalFindings,
          critical: latestAudit.critical,
          high: latestAudit.high,
          medium: latestAudit.medium,
          low: latestAudit.low,
          riskScore: latestAudit.riskScore || 0,
          subscriptionName: latestAudit.subscription.name,
          lastScanAt: latestAudit.completedAt?.toISOString() || null,
        }
      : {
          totalFindings: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          riskScore: 0,
          subscriptionName: subscriptions[0]?.name || "No subscription",
          lastScanAt: null,
        };

    return NextResponse.json({
      stats,
      phases: latestAudit?.phases || [],
      findings: latestAudit?.findings || [],
      historicalAudits,
      subscriptions,
    });
  } catch (error) {
    console.error("Azure Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
