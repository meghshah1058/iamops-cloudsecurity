import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return settings or defaults
    const settings = user.settings || {
      // Spike.sh
      spikeWebhookUrl: "",
      spikeEnabled: false,
      spikeAlertOnCritical: true,
      spikeAlertOnHigh: false,
      // Slack
      slackWebhookUrl: "",
      slackEnabled: false,
      slackAlertOnCritical: true,
      slackAlertOnHigh: false,
      // Email
      emailAddress: "",
      emailEnabled: false,
      emailAlertOnCritical: true,
      emailAlertOnHigh: false,
      // General
      emailAlerts: true,
      alertThreshold: "CRITICAL",
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST/UPDATE user settings
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
      // Spike.sh
      spikeWebhookUrl,
      spikeEnabled,
      spikeAlertOnCritical,
      spikeAlertOnHigh,
      // Slack
      slackWebhookUrl,
      slackEnabled,
      slackAlertOnCritical,
      slackAlertOnHigh,
      // Email
      emailAddress,
      emailEnabled,
      emailAlertOnCritical,
      emailAlertOnHigh,
      // General
      emailAlerts,
      alertThreshold,
    } = body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        // Spike.sh
        spikeWebhookUrl: spikeWebhookUrl ?? undefined,
        spikeEnabled: spikeEnabled ?? undefined,
        spikeAlertOnCritical: spikeAlertOnCritical ?? undefined,
        spikeAlertOnHigh: spikeAlertOnHigh ?? undefined,
        // Slack
        slackWebhookUrl: slackWebhookUrl ?? undefined,
        slackEnabled: slackEnabled ?? undefined,
        slackAlertOnCritical: slackAlertOnCritical ?? undefined,
        slackAlertOnHigh: slackAlertOnHigh ?? undefined,
        // Email
        emailAddress: emailAddress ?? undefined,
        emailEnabled: emailEnabled ?? undefined,
        emailAlertOnCritical: emailAlertOnCritical ?? undefined,
        emailAlertOnHigh: emailAlertOnHigh ?? undefined,
        // General
        emailAlerts: emailAlerts ?? undefined,
        alertThreshold: alertThreshold ?? undefined,
      },
      create: {
        userId: user.id,
        // Spike.sh
        spikeWebhookUrl: spikeWebhookUrl || null,
        spikeEnabled: spikeEnabled || false,
        spikeAlertOnCritical: spikeAlertOnCritical ?? true,
        spikeAlertOnHigh: spikeAlertOnHigh || false,
        // Slack
        slackWebhookUrl: slackWebhookUrl || null,
        slackEnabled: slackEnabled || false,
        slackAlertOnCritical: slackAlertOnCritical ?? true,
        slackAlertOnHigh: slackAlertOnHigh || false,
        // Email
        emailAddress: emailAddress || null,
        emailEnabled: emailEnabled || false,
        emailAlertOnCritical: emailAlertOnCritical ?? true,
        emailAlertOnHigh: emailAlertOnHigh || false,
        // General
        emailAlerts: emailAlerts ?? true,
        alertThreshold: alertThreshold || "CRITICAL",
      },
    });

    return NextResponse.json({ settings, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
