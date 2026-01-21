import { prisma } from "@/lib/db";
import {
  sendAuditSummaryAlert,
  sendAuditSummarySlackAlert,
  sendAuditSummaryEmail,
} from "@/lib/integrations";

export type CloudProvider = "AWS" | "GCP" | "AZURE";

interface ScanResult {
  success: boolean;
  auditId?: string;
  error?: string;
  duration?: number;
  summary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

/**
 * Execute a scheduled scan for an AWS account
 */
export async function executeAwsScan(accountId: string): Promise<ScanResult> {
  const startTime = Date.now();

  try {
    // Get the account
    const account = await prisma.awsAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Create a new audit record
    const audit = await prisma.awsAudit.create({
      data: {
        accountId: account.id,
        status: "running",
        startedAt: new Date(),
      },
    });

    // TODO: In a real implementation, this would trigger the actual AWS scan
    // For now, we'll create a placeholder audit that can be completed by the scan-stream route
    // The scan-stream route should be called separately to perform the actual scan

    console.log(`[Scheduler] AWS scan initiated for account ${account.name} (audit: ${audit.id})`);

    // Update account's lastScanAt
    await prisma.awsAccount.update({
      where: { id: accountId },
      data: { lastScanAt: new Date() },
    });

    const duration = Date.now() - startTime;

    return {
      success: true,
      auditId: audit.id,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Scheduler] AWS scan failed for account ${accountId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration,
    };
  }
}

/**
 * Execute a scheduled scan for a GCP project
 */
export async function executeGcpScan(projectId: string): Promise<ScanResult> {
  const startTime = Date.now();

  try {
    // Get the project
    const project = await prisma.gcpProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Create a new audit record
    const audit = await prisma.gcpAudit.create({
      data: {
        projectId: project.id,
        status: "running",
        startedAt: new Date(),
      },
    });

    console.log(`[Scheduler] GCP scan initiated for project ${project.name} (audit: ${audit.id})`);

    // Update project's lastScanAt
    await prisma.gcpProject.update({
      where: { id: projectId },
      data: { lastScanAt: new Date() },
    });

    const duration = Date.now() - startTime;

    return {
      success: true,
      auditId: audit.id,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Scheduler] GCP scan failed for project ${projectId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration,
    };
  }
}

/**
 * Execute a scheduled scan for an Azure subscription
 */
export async function executeAzureScan(subscriptionId: string): Promise<ScanResult> {
  const startTime = Date.now();

  try {
    // Get the subscription
    const subscription = await prisma.azureSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return { success: false, error: "Subscription not found" };
    }

    // Create a new audit record
    const audit = await prisma.azureAudit.create({
      data: {
        subscriptionId: subscription.id,
        status: "running",
        startedAt: new Date(),
      },
    });

    console.log(`[Scheduler] Azure scan initiated for subscription ${subscription.name} (audit: ${audit.id})`);

    // Update subscription's lastScanAt
    await prisma.azureSubscription.update({
      where: { id: subscriptionId },
      data: { lastScanAt: new Date() },
    });

    const duration = Date.now() - startTime;

    return {
      success: true,
      auditId: audit.id,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Scheduler] Azure scan failed for subscription ${subscriptionId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration,
    };
  }
}

/**
 * Log a scheduled scan execution
 */
export async function logScheduledScan(
  cloudProvider: CloudProvider,
  accountId: string,
  userId: string,
  scheduledFor: Date,
  result: ScanResult
): Promise<void> {
  try {
    await prisma.scheduledScanLog.create({
      data: {
        cloudProvider,
        accountId,
        userId,
        status: result.success ? "success" : "failed",
        auditId: result.auditId,
        errorMessage: result.error,
        scheduledFor,
        executedAt: new Date(),
        duration: result.duration,
      },
    });
  } catch (error) {
    console.error("[Scheduler] Failed to log scheduled scan:", error);
  }
}

/**
 * Calculate the next scheduled scan time based on frequency settings
 */
export function calculateNextScanTime(
  frequency: string,
  hour: number,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null
): Date {
  const now = new Date();
  const next = new Date(now);

  // Set the hour
  next.setHours(hour, 0, 0, 0);

  switch (frequency) {
    case "daily":
      // If the time has already passed today, schedule for tomorrow
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      break;

    case "weekly":
      // Set to the specified day of week (0 = Sunday, 6 = Saturday)
      const targetDay = dayOfWeek ?? 0;
      const currentDay = next.getDay();
      let daysUntilTarget = targetDay - currentDay;

      if (daysUntilTarget < 0 || (daysUntilTarget === 0 && next <= now)) {
        daysUntilTarget += 7;
      }

      next.setDate(next.getDate() + daysUntilTarget);
      break;

    case "monthly":
      // Set to the specified day of month
      const targetDate = dayOfMonth ?? 1;
      next.setDate(targetDate);

      // If the date has passed this month, move to next month
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      break;

    default:
      // Default to daily
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
  }

  return next;
}

/**
 * Send alerts for a completed audit
 */
export async function sendAuditAlerts(
  userId: string,
  cloudProvider: CloudProvider,
  accountName: string,
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  }
): Promise<void> {
  try {
    // Send alerts to all configured integrations in parallel
    await Promise.allSettled([
      sendAuditSummaryAlert(userId, cloudProvider, accountName, summary),
      sendAuditSummarySlackAlert(userId, cloudProvider, accountName, summary),
      sendAuditSummaryEmail(userId, cloudProvider, accountName, summary),
    ]);
  } catch (error) {
    console.error("[Scheduler] Failed to send audit alerts:", error);
  }
}
