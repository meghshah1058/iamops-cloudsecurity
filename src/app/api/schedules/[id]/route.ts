import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { triggerScan, type CloudProvider } from "@/lib/scheduler";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET schedule details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const cloudProvider = searchParams.get("cloudProvider") as CloudProvider;

    if (!cloudProvider) {
      return NextResponse.json(
        { error: "Cloud provider is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let resource;

    switch (cloudProvider) {
      case "AWS":
        resource = await prisma.awsAccount.findFirst({
          where: { id, userId: user.id },
        });
        break;
      case "GCP":
        resource = await prisma.gcpProject.findFirst({
          where: { id, userId: user.id },
        });
        break;
      case "AZURE":
        resource = await prisma.azureSubscription.findFirst({
          where: { id, userId: user.id },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid cloud provider" },
          { status: 400 }
        );
    }

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Get recent logs for this resource
    const recentLogs = await prisma.scheduledScanLog.findMany({
      where: {
        cloudProvider,
        accountId: id,
      },
      orderBy: { executedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      schedule: {
        ...resource,
        cloudProvider,
      },
      recentLogs,
    });
  } catch (error) {
    console.error("Schedule details API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE schedule (disable scheduling)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const cloudProvider = searchParams.get("cloudProvider") as CloudProvider;

    if (!cloudProvider) {
      return NextResponse.json(
        { error: "Cloud provider is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Disable schedule
    switch (cloudProvider) {
      case "AWS":
        await prisma.awsAccount.updateMany({
          where: { id, userId: user.id },
          data: {
            scheduleEnabled: false,
            scheduleFrequency: null,
            scheduleHour: null,
            scheduleDayOfWeek: null,
            scheduleDayOfMonth: null,
            nextScheduledScan: null,
          },
        });
        break;
      case "GCP":
        await prisma.gcpProject.updateMany({
          where: { id, userId: user.id },
          data: {
            scheduleEnabled: false,
            scheduleFrequency: null,
            scheduleHour: null,
            scheduleDayOfWeek: null,
            scheduleDayOfMonth: null,
            nextScheduledScan: null,
          },
        });
        break;
      case "AZURE":
        await prisma.azureSubscription.updateMany({
          where: { id, userId: user.id },
          data: {
            scheduleEnabled: false,
            scheduleFrequency: null,
            scheduleHour: null,
            scheduleDayOfWeek: null,
            scheduleDayOfMonth: null,
            nextScheduledScan: null,
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
      message: "Schedule disabled successfully",
    });
  } catch (error) {
    console.error("Schedule delete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST trigger manual scan
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { cloudProvider } = body as { cloudProvider: CloudProvider };

    if (!cloudProvider) {
      return NextResponse.json(
        { error: "Cloud provider is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    let resource;
    switch (cloudProvider) {
      case "AWS":
        resource = await prisma.awsAccount.findFirst({
          where: { id, userId: user.id },
        });
        break;
      case "GCP":
        resource = await prisma.gcpProject.findFirst({
          where: { id, userId: user.id },
        });
        break;
      case "AZURE":
        resource = await prisma.azureSubscription.findFirst({
          where: { id, userId: user.id },
        });
        break;
    }

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Trigger manual scan
    const result = await triggerScan(cloudProvider, id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        auditId: result.auditId,
        message: "Scan triggered successfully",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to trigger scan" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Manual scan trigger API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
