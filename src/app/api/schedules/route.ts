import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateNextScanTime } from "@/lib/scheduler/scan-executor";

// GET all schedules for the user
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

    // Get all scheduled accounts/projects/subscriptions
    const [awsAccounts, gcpProjects, azureSubscriptions] = await Promise.all([
      prisma.awsAccount.findMany({
        where: { userId: user.id, scheduleEnabled: true },
        select: {
          id: true,
          name: true,
          accountId: true,
          scheduleEnabled: true,
          scheduleFrequency: true,
          scheduleHour: true,
          scheduleDayOfWeek: true,
          scheduleDayOfMonth: true,
          nextScheduledScan: true,
          lastScanAt: true,
        },
      }),
      prisma.gcpProject.findMany({
        where: { userId: user.id, scheduleEnabled: true },
        select: {
          id: true,
          name: true,
          projectId: true,
          scheduleEnabled: true,
          scheduleFrequency: true,
          scheduleHour: true,
          scheduleDayOfWeek: true,
          scheduleDayOfMonth: true,
          nextScheduledScan: true,
          lastScanAt: true,
        },
      }),
      prisma.azureSubscription.findMany({
        where: { userId: user.id, scheduleEnabled: true },
        select: {
          id: true,
          name: true,
          subscriptionId: true,
          scheduleEnabled: true,
          scheduleFrequency: true,
          scheduleHour: true,
          scheduleDayOfWeek: true,
          scheduleDayOfMonth: true,
          nextScheduledScan: true,
          lastScanAt: true,
        },
      }),
    ]);

    // Format response
    const schedules = [
      ...awsAccounts.map((a) => ({
        ...a,
        cloudProvider: "AWS" as const,
        resourceId: a.accountId,
      })),
      ...gcpProjects.map((p) => ({
        ...p,
        cloudProvider: "GCP" as const,
        resourceId: p.projectId,
      })),
      ...azureSubscriptions.map((s) => ({
        ...s,
        cloudProvider: "AZURE" as const,
        resourceId: s.subscriptionId,
      })),
    ];

    // Get recent scan logs
    const recentLogs = await prisma.scheduledScanLog.findMany({
      where: { userId: user.id },
      orderBy: { executedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ schedules, recentLogs });
  } catch (error) {
    console.error("Schedules API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create/update schedule
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
    const {
      cloudProvider,
      accountId, // This is the database ID, not the cloud account ID
      scheduleEnabled,
      scheduleFrequency,
      scheduleHour,
      scheduleDayOfWeek,
      scheduleDayOfMonth,
    } = body;

    // Validate required fields
    if (!cloudProvider || !accountId) {
      return NextResponse.json(
        { error: "Cloud provider and account ID are required" },
        { status: 400 }
      );
    }

    if (scheduleEnabled && (!scheduleFrequency || scheduleHour === undefined)) {
      return NextResponse.json(
        { error: "Frequency and hour are required when enabling schedule" },
        { status: 400 }
      );
    }

    // Calculate next scan time if enabling
    let nextScheduledScan: Date | null = null;
    if (scheduleEnabled && scheduleFrequency && scheduleHour !== undefined) {
      nextScheduledScan = calculateNextScanTime(
        scheduleFrequency,
        scheduleHour,
        scheduleDayOfWeek,
        scheduleDayOfMonth
      );
    }

    // Update the appropriate model
    let updatedResource;

    switch (cloudProvider) {
      case "AWS":
        // Verify ownership
        const awsAccount = await prisma.awsAccount.findFirst({
          where: { id: accountId, userId: user.id },
        });
        if (!awsAccount) {
          return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        updatedResource = await prisma.awsAccount.update({
          where: { id: accountId },
          data: {
            scheduleEnabled,
            scheduleFrequency: scheduleEnabled ? scheduleFrequency : null,
            scheduleHour: scheduleEnabled ? scheduleHour : null,
            scheduleDayOfWeek: scheduleEnabled ? scheduleDayOfWeek : null,
            scheduleDayOfMonth: scheduleEnabled ? scheduleDayOfMonth : null,
            nextScheduledScan,
          },
        });
        break;

      case "GCP":
        // Verify ownership
        const gcpProject = await prisma.gcpProject.findFirst({
          where: { id: accountId, userId: user.id },
        });
        if (!gcpProject) {
          return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        updatedResource = await prisma.gcpProject.update({
          where: { id: accountId },
          data: {
            scheduleEnabled,
            scheduleFrequency: scheduleEnabled ? scheduleFrequency : null,
            scheduleHour: scheduleEnabled ? scheduleHour : null,
            scheduleDayOfWeek: scheduleEnabled ? scheduleDayOfWeek : null,
            scheduleDayOfMonth: scheduleEnabled ? scheduleDayOfMonth : null,
            nextScheduledScan,
          },
        });
        break;

      case "AZURE":
        // Verify ownership
        const azureSubscription = await prisma.azureSubscription.findFirst({
          where: { id: accountId, userId: user.id },
        });
        if (!azureSubscription) {
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        updatedResource = await prisma.azureSubscription.update({
          where: { id: accountId },
          data: {
            scheduleEnabled,
            scheduleFrequency: scheduleEnabled ? scheduleFrequency : null,
            scheduleHour: scheduleEnabled ? scheduleHour : null,
            scheduleDayOfWeek: scheduleEnabled ? scheduleDayOfWeek : null,
            scheduleDayOfMonth: scheduleEnabled ? scheduleDayOfMonth : null,
            nextScheduledScan,
          },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid cloud provider" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      schedule: {
        ...updatedResource,
        cloudProvider,
      },
      message: scheduleEnabled
        ? `Schedule enabled. Next scan at ${nextScheduledScan?.toISOString()}`
        : "Schedule disabled",
    });
  } catch (error) {
    console.error("Schedules API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
