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
      include: {
        awsAccounts: {
          include: {
            audits: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get latest audit for dashboard stats
    const latestAudit = await prisma.audit.findFirst({
      where: {
        account: {
          userId: user.id,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        account: true,
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
            createdAt: true,
          },
        },
      },
    });

    // Get historical audit data for charts (last 7 audits)
    const historicalAudits = await prisma.audit.findMany({
      where: {
        account: {
          userId: user.id,
        },
        status: "completed",
      },
      orderBy: { completedAt: "desc" },
      take: 7,
      select: {
        id: true,
        critical: true,
        high: true,
        medium: true,
        low: true,
        totalFindings: true,
        riskScore: true,
        completedAt: true,
        account: {
          select: {
            name: true,
          },
        },
      },
    });

    // Recent activity (last 10 events)
    const recentFindings = await prisma.finding.findMany({
      where: {
        audit: {
          account: {
            userId: user.id,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        audit: {
          include: {
            account: true,
          },
        },
      },
    });

    // Calculate stats
    const stats = {
      totalFindings: latestAudit?.totalFindings || 0,
      critical: latestAudit?.critical || 0,
      high: latestAudit?.high || 0,
      medium: latestAudit?.medium || 0,
      low: latestAudit?.low || 0,
      riskScore: latestAudit?.riskScore || 0,
      accountName: latestAudit?.account?.name || "No accounts",
      lastScanAt: latestAudit?.completedAt || null,
    };

    return NextResponse.json({
      stats,
      phases: latestAudit?.phases || [],
      findings: latestAudit?.findings || [],
      historicalAudits: historicalAudits.reverse(),
      recentActivity: recentFindings,
      accounts: user.awsAccounts,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
