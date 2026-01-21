import { prisma } from "@/lib/db";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from address (use your verified domain)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "security@cloudguard.dev";
const FROM_NAME = "CloudGuard Security";

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
 * Get severity color for email styling
 */
function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "#dc2626";
    case "HIGH":
      return "#ea580c";
    case "MEDIUM":
      return "#eab308";
    case "LOW":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}

/**
 * Generate HTML email for a security finding
 */
function generateFindingEmailHtml(
  cloudProvider: string,
  accountName: string,
  finding: Finding
): string {
  const severity = finding.severity.toUpperCase();
  const color = getSeverityColor(severity);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert - ${finding.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ CloudGuard Security</h1>
    </div>

    <!-- Alert Badge -->
    <div style="background-color: ${color}; padding: 16px; text-align: center;">
      <span style="color: white; font-weight: bold; font-size: 18px;">
        ${severity === "CRITICAL" ? "🚨" : "⚠️"} ${severity} Security Finding
      </span>
    </div>

    <!-- Content -->
    <div style="background-color: #1a1a2e; border-radius: 0 0 12px 12px; padding: 24px; color: white;">
      <h2 style="color: white; margin: 0 0 16px 0; font-size: 20px;">
        [${cloudProvider}] ${finding.title}
      </h2>

      <!-- Details Grid -->
      <div style="display: grid; gap: 12px; margin-bottom: 20px;">
        <div style="background-color: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px;">
          <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-bottom: 4px;">ACCOUNT</div>
          <div style="color: white; font-weight: 500;">${accountName}</div>
        </div>

        <div style="background-color: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px;">
          <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-bottom: 4px;">RESOURCE</div>
          <div style="color: white; font-family: monospace; font-size: 14px; word-break: break-all;">${finding.resource}</div>
        </div>

        <div style="display: flex; gap: 12px;">
          <div style="flex: 1; background-color: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px;">
            <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-bottom: 4px;">REGION</div>
            <div style="color: white;">${finding.region || "N/A"}</div>
          </div>
          <div style="flex: 1; background-color: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px;">
            <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-bottom: 4px;">TYPE</div>
            <div style="color: white;">${finding.resourceType || "Unknown"}</div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 8px 0;">Description</h3>
        <p style="color: rgba(255,255,255,0.7); margin: 0; line-height: 1.6;">
          ${finding.description || finding.title}
        </p>
      </div>

      <!-- Recommendation -->
      <div style="background: linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%); border-left: 3px solid #22c55e; border-radius: 0 8px 8px 0; padding: 16px;">
        <h3 style="color: #22c55e; font-size: 14px; margin: 0 0 8px 0;">💡 Recommendation</h3>
        <p style="color: rgba(255,255,255,0.8); margin: 0; line-height: 1.6;">
          ${finding.recommendation || "Review this finding and take appropriate action."}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.4); font-size: 12px;">
      <p style="margin: 0;">This alert was sent by CloudGuard Security Dashboard</p>
      <p style="margin: 8px 0 0 0;">Configure your alert preferences in Settings → Integrations</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML email for audit summary
 */
function generateSummaryEmailHtml(
  cloudProvider: string,
  accountName: string,
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  }
): string {
  const isCritical = summary.critical > 0;
  const headerColor = isCritical ? "#dc2626" : "#ea580c";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Audit Summary - ${accountName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ CloudGuard Security</h1>
    </div>

    <!-- Alert Badge -->
    <div style="background-color: ${headerColor}; padding: 16px; text-align: center;">
      <span style="color: white; font-weight: bold; font-size: 18px;">
        ${isCritical ? "🚨" : "⚠️"} Security Audit Complete
      </span>
    </div>

    <!-- Content -->
    <div style="background-color: #1a1a2e; border-radius: 0 0 12px 12px; padding: 24px; color: white;">
      <h2 style="color: white; margin: 0 0 8px 0; font-size: 20px;">
        [${cloudProvider}] ${accountName}
      </h2>
      <p style="color: rgba(255,255,255,0.6); margin: 0 0 24px 0;">
        Security audit completed with ${summary.total} findings
      </p>

      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
        <div style="background-color: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.3); border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 36px; font-weight: bold; color: #dc2626;">${summary.critical}</div>
          <div style="color: rgba(255,255,255,0.6); font-size: 14px;">Critical</div>
        </div>
        <div style="background-color: rgba(234,88,12,0.1); border: 1px solid rgba(234,88,12,0.3); border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 36px; font-weight: bold; color: #ea580c;">${summary.high}</div>
          <div style="color: rgba(255,255,255,0.6); font-size: 14px;">High</div>
        </div>
        <div style="background-color: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 36px; font-weight: bold; color: #eab308;">${summary.medium}</div>
          <div style="color: rgba(255,255,255,0.6); font-size: 14px;">Medium</div>
        </div>
        <div style="background-color: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 36px; font-weight: bold; color: #22c55e;">${summary.low}</div>
          <div style="color: rgba(255,255,255,0.6); font-size: 14px;">Low</div>
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard"
           style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
          View Full Report
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.4); font-size: 12px;">
      <p style="margin: 0;">This report was sent by CloudGuard Security Dashboard</p>
      <p style="margin: 8px 0 0 0;">Configure your alert preferences in Settings → Integrations</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send a finding alert via email if enabled
 */
export async function sendEmailAlert(options: AlertOptions): Promise<boolean> {
  const { userId, cloudProvider, accountName, finding } = options;

  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.log("Resend API key not configured, skipping email alert");
      return false;
    }

    // Get user and settings
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
      prisma.userSettings.findUnique({ where: { userId } }),
    ]);

    // Check if email alerts are enabled
    if (!settings?.emailEnabled) {
      return false;
    }

    const severity = finding.severity.toUpperCase();

    // Check if we should alert for this severity
    if (severity === "CRITICAL" && !settings.emailAlertOnCritical) {
      return false;
    }
    if (severity === "HIGH" && !settings.emailAlertOnHigh) {
      return false;
    }
    // Skip MEDIUM and LOW by default
    if (severity !== "CRITICAL" && severity !== "HIGH") {
      return false;
    }

    // Determine recipient email
    const recipientEmail = settings.emailAddress || user?.email;
    if (!recipientEmail) {
      console.error("No email address found for user");
      return false;
    }

    // Generate email content
    const html = generateFindingEmailHtml(cloudProvider, accountName, finding);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: `[${cloudProvider}] ${severity}: ${finding.title}`,
      html,
    });

    if (error) {
      console.error("Email alert failed:", error);
      return false;
    }

    console.log(`Email alert sent for ${severity} finding: ${finding.title}`, data?.id);
    return true;
  } catch (error) {
    console.error("Error sending email alert:", error);
    return false;
  }
}

/**
 * Send multiple finding alerts via email
 */
export async function sendBulkEmailAlerts(
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

  // Limit to first 10 findings to avoid spamming
  const limitedFindings = alertableFindings.slice(0, 10);

  for (const finding of limitedFindings) {
    const success = await sendEmailAlert({
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

    // Add delay between emails to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return { sent, skipped };
}

/**
 * Send an audit summary email
 */
export async function sendAuditSummaryEmail(
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
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.log("Resend API key not configured, skipping email");
      return false;
    }

    // Get user and settings
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
      prisma.userSettings.findUnique({ where: { userId } }),
    ]);

    if (!settings?.emailEnabled) {
      return false;
    }

    // Only send summary if there are critical or high findings
    if (summary.critical === 0 && summary.high === 0) {
      return false;
    }

    // Determine recipient email
    const recipientEmail = settings.emailAddress || user?.email;
    if (!recipientEmail) {
      console.error("No email address found for user");
      return false;
    }

    // Generate email content
    const html = generateSummaryEmailHtml(cloudProvider, accountName, summary);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: `[${cloudProvider}] Security Audit Complete - ${summary.critical} Critical, ${summary.high} High findings`,
      html,
    });

    if (error) {
      console.error("Email summary failed:", error);
      return false;
    }

    console.log(`Audit summary email sent for ${accountName}`, data?.id);
    return true;
  } catch (error) {
    console.error("Error sending audit summary email:", error);
    return false;
  }
}

/**
 * Send a test email to verify configuration
 */
export async function sendTestEmail(toEmail: string): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("Resend API key not configured");
      return false;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CloudGuard Test Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ CloudGuard Security</h1>
    </div>

    <!-- Success Badge -->
    <div style="background-color: #22c55e; padding: 16px; text-align: center;">
      <span style="color: white; font-weight: bold; font-size: 18px;">
        ✅ Email Configuration Successful
      </span>
    </div>

    <!-- Content -->
    <div style="background-color: #1a1a2e; border-radius: 0 0 12px 12px; padding: 24px; color: white; text-align: center;">
      <h2 style="color: white; margin: 0 0 16px 0; font-size: 20px;">
        Your email alerts are working!
      </h2>
      <p style="color: rgba(255,255,255,0.7); margin: 0 0 24px 0; line-height: 1.6;">
        You will receive security alerts at this email address when critical or high severity findings are detected.
      </p>

      <div style="background-color: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-bottom: 4px;">TEST SENT AT</div>
        <div style="color: white; font-family: monospace;">${new Date().toISOString()}</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.4); font-size: 12px;">
      <p style="margin: 0;">This test was sent by CloudGuard Security Dashboard</p>
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toEmail,
      subject: "✅ CloudGuard - Email Configuration Test",
      html,
    });

    if (error) {
      console.error("Test email failed:", error);
      return false;
    }

    console.log("Test email sent successfully", data?.id);
    return true;
  } catch (error) {
    console.error("Error sending test email:", error);
    return false;
  }
}
