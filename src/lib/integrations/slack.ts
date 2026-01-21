import { prisma } from "@/lib/db";

interface Finding {
  severity: string;
  title: string;
  description?: string | null;
  resource: string;
  resourceType?: string | null;
  region?: string | null;
  recommendation?: string | null;
}

interface AlertOptions {
  userId: string;
  cloudProvider: "AWS" | "GCP" | "AZURE";
  accountName: string;
  finding: Finding;
}

/**
 * Get Slack color based on severity
 */
function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "#dc2626"; // Red
    case "HIGH":
      return "#ea580c"; // Orange
    case "MEDIUM":
      return "#eab308"; // Yellow
    case "LOW":
      return "#22c55e"; // Green
    default:
      return "#6b7280"; // Gray
  }
}

/**
 * Get cloud provider emoji
 */
function getCloudEmoji(cloudProvider: string): string {
  switch (cloudProvider) {
    case "AWS":
      return ":aws:";
    case "GCP":
      return ":google-cloud:";
    case "AZURE":
      return ":azure:";
    default:
      return ":cloud:";
  }
}

/**
 * Send a finding alert to Slack if enabled
 */
export async function sendSlackAlert(options: AlertOptions): Promise<boolean> {
  const { userId, cloudProvider, accountName, finding } = options;

  try {
    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Check if Slack is enabled
    if (!settings?.slackEnabled || !settings?.slackWebhookUrl) {
      return false;
    }

    const severity = finding.severity.toUpperCase();

    // Check if we should alert for this severity
    if (severity === "CRITICAL" && !settings.slackAlertOnCritical) {
      return false;
    }
    if (severity === "HIGH" && !settings.slackAlertOnHigh) {
      return false;
    }
    // Skip MEDIUM and LOW by default
    if (severity !== "CRITICAL" && severity !== "HIGH") {
      return false;
    }

    // Construct Slack Block Kit message
    const slackPayload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${severity === "CRITICAL" ? "🚨" : "⚠️"} [${cloudProvider}] ${severity}: ${finding.title}`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Severity:*\n${severity}`,
            },
            {
              type: "mrkdwn",
              text: `*Cloud Provider:*\n${cloudProvider}`,
            },
            {
              type: "mrkdwn",
              text: `*Resource:*\n\`${finding.resource}\``,
            },
            {
              type: "mrkdwn",
              text: `*Region:*\n${finding.region || "N/A"}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Description:*\n${finding.description || finding.title}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `💡 *Recommendation:* ${finding.recommendation || "Review this finding and take appropriate action."}`,
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Account: *${accountName}* | Resource Type: ${finding.resourceType || "Unknown"} | Source: CloudGuard Security Dashboard`,
            },
          ],
        },
        {
          type: "divider",
        },
      ],
      attachments: [
        {
          color: getSeverityColor(severity),
          fallback: `[${cloudProvider}] ${severity}: ${finding.title}`,
        },
      ],
    };

    // Send alert to Slack
    const response = await fetch(settings.slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      console.error("Slack alert failed:", await response.text());
      return false;
    }

    console.log(`Slack alert sent for ${severity} finding: ${finding.title}`);
    return true;
  } catch (error) {
    console.error("Error sending Slack alert:", error);
    return false;
  }
}

/**
 * Send multiple finding alerts to Slack
 * Groups by severity to avoid alert fatigue
 */
export async function sendBulkSlackAlerts(
  userId: string,
  cloudProvider: "AWS" | "GCP" | "AZURE",
  accountName: string,
  findings: Finding[]
): Promise<{ sent: number; skipped: number }> {
  let sent = 0;
  let skipped = 0;

  // Filter to only critical and high findings
  const alertableFindings = findings.filter(
    (f) =>
      f.severity.toUpperCase() === "CRITICAL" ||
      f.severity.toUpperCase() === "HIGH"
  );

  for (const finding of alertableFindings) {
    const success = await sendSlackAlert({
      userId,
      cloudProvider,
      accountName,
      finding,
    });

    if (success) {
      sent++;
    } else {
      skipped++;
    }

    // Add a small delay between alerts to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return { sent, skipped };
}

/**
 * Send an audit summary alert to Slack
 */
export async function sendAuditSummarySlackAlert(
  userId: string,
  cloudProvider: "AWS" | "GCP" | "AZURE",
  accountName: string,
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  }
): Promise<boolean> {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings?.slackEnabled || !settings?.slackWebhookUrl) {
      return false;
    }

    // Only send summary if there are critical or high findings
    if (summary.critical === 0 && summary.high === 0) {
      return false;
    }

    const isCritical = summary.critical > 0;
    const color = isCritical ? "#dc2626" : "#ea580c";

    const slackPayload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${isCritical ? "🚨" : "⚠️"} [${cloudProvider}] Security Audit Complete`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Security audit completed for *${accountName}*`,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*🔴 Critical:*\n${summary.critical}`,
            },
            {
              type: "mrkdwn",
              text: `*🟠 High:*\n${summary.high}`,
            },
            {
              type: "mrkdwn",
              text: `*🟡 Medium:*\n${summary.medium}`,
            },
            {
              type: "mrkdwn",
              text: `*🟢 Low:*\n${summary.low}`,
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `📊 *Total Findings:* ${summary.total} | Cloud: ${cloudProvider} | Source: CloudGuard Security Dashboard`,
            },
          ],
        },
        {
          type: "divider",
        },
      ],
      attachments: [
        {
          color: color,
          fallback: `[${cloudProvider}] Audit Complete - ${summary.critical} Critical, ${summary.high} High findings`,
        },
      ],
    };

    const response = await fetch(settings.slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      console.error("Slack summary alert failed:", await response.text());
      return false;
    }

    console.log(`Slack audit summary alert sent for ${accountName}`);
    return true;
  } catch (error) {
    console.error("Error sending Slack summary alert:", error);
    return false;
  }
}

/**
 * Send a test message to Slack to verify webhook configuration
 */
export async function sendSlackTestMessage(webhookUrl: string): Promise<boolean> {
  try {
    const slackPayload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "✅ CloudGuard Test Alert",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Your Slack webhook is configured correctly! You will receive security alerts here.",
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Status:*\nWebhook Connected",
            },
            {
              type: "mrkdwn",
              text: "*Source:*\nCloudGuard Security Dashboard",
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🕐 Test sent at ${new Date().toISOString()}`,
            },
          ],
        },
      ],
      attachments: [
        {
          color: "#22c55e",
          fallback: "CloudGuard Test Alert - Webhook configured successfully!",
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      console.error("Slack test message failed:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Slack test message:", error);
    return false;
  }
}
