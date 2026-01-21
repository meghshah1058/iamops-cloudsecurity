import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendSlackTestMessage } from "@/lib/integrations/slack";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { webhookUrl } = body;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Webhook URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(webhookUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook URL format" },
        { status: 400 }
      );
    }

    // Send test message
    const success = await sendSlackTestMessage(webhookUrl);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Test message sent to Slack successfully!",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send test message. Please check your webhook URL." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Slack test error:", error);
    return NextResponse.json(
      { error: "Failed to send test message" },
      { status: 500 }
    );
  }
}
