import cron from "node-cron";
import { prisma } from "@/lib/db";
import {
  executeAwsScan,
  executeGcpScan,
  executeAzureScan,
  logScheduledScan,
  calculateNextScanTime,
  sendAuditAlerts,
  CloudProvider,
} from "./scan-executor";

// Track if scheduler is already initialized
let isInitialized = false;

// Store cron job references for cleanup
let schedulerJob: cron.ScheduledTask | null = null;

/**
 * Initialize the scheduler
 * This should be called once when the server starts
 */
export function initializeScheduler(): void {
  if (isInitialized) {
    console.log("[Scheduler] Already initialized, skipping...");
    return;
  }

  console.log("[Scheduler] Initializing scheduled scan system...");

  // Run the scheduler check every minute
  // This checks for accounts/projects/subscriptions that need to be scanned
  schedulerJob = cron.schedule("* * * * *", async () => {
    await checkAndExecuteScheduledScans();
  });

  isInitialized = true;
  console.log("[Scheduler] Scheduler initialized successfully");
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  if (schedulerJob) {
    schedulerJob.stop();
    schedulerJob = null;
  }
  isInitialized = false;
  console.log("[Scheduler] Scheduler stopped");
}

/**
 * Check for scheduled scans that need to be executed
 */
async function checkAndExecuteScheduledScans(): Promise<void> {
  const now = new Date();

  try {
    // Check AWS accounts
    const awsAccounts = await prisma.awsAccount.findMany({
      where: {
        scheduleEnabled: true,
        isActive: true,
        nextScheduledScan: {
          lte: now,
        },
      },
      include: {
        user: true,
      },
    });

    for (const account of awsAccounts) {
      await processAwsScheduledScan(account);
    }

    // Check GCP projects
    const gcpProjects = await prisma.gcpProject.findMany({
      where: {
        scheduleEnabled: true,
        isActive: true,
        nextScheduledScan: {
          lte: now,
        },
      },
      include: {
        user: true,
      },
    });

    for (const project of gcpProjects) {
      await processGcpScheduledScan(project);
    }

    // Check Azure subscriptions
    const azureSubscriptions = await prisma.azureSubscription.findMany({
      where: {
        scheduleEnabled: true,
        isActive: true,
        nextScheduledScan: {
          lte: now,
        },
      },
      include: {
        user: true,
      },
    });

    for (const subscription of azureSubscriptions) {
      await processAzureScheduledScan(subscription);
    }
  } catch (error) {
    console.error("[Scheduler] Error checking scheduled scans:", error);
  }
}

/**
 * Process a scheduled AWS scan
 */
async function processAwsScheduledScan(account: {
  id: string;
  name: string;
  userId: string;
  scheduleFrequency: string | null;
  scheduleHour: number | null;
  scheduleDayOfWeek: number | null;
  scheduleDayOfMonth: number | null;
  nextScheduledScan: Date | null;
}): Promise<void> {
  console.log(`[Scheduler] Executing scheduled AWS scan for account: ${account.name}`);

  const scheduledFor = account.nextScheduledScan || new Date();
  const result = await executeAwsScan(account.id);

  // Log the scan execution
  await logScheduledScan(
    "AWS",
    account.id,
    account.userId,
    scheduledFor,
    result
  );

  // Calculate and update next scheduled scan time
  if (account.scheduleFrequency && account.scheduleHour !== null) {
    const nextScan = calculateNextScanTime(
      account.scheduleFrequency,
      account.scheduleHour,
      account.scheduleDayOfWeek,
      account.scheduleDayOfMonth
    );

    await prisma.awsAccount.update({
      where: { id: account.id },
      data: { nextScheduledScan: nextScan },
    });

    console.log(`[Scheduler] Next AWS scan for ${account.name} scheduled at: ${nextScan.toISOString()}`);
  }
}

/**
 * Process a scheduled GCP scan
 */
async function processGcpScheduledScan(project: {
  id: string;
  name: string;
  userId: string;
  scheduleFrequency: string | null;
  scheduleHour: number | null;
  scheduleDayOfWeek: number | null;
  scheduleDayOfMonth: number | null;
  nextScheduledScan: Date | null;
}): Promise<void> {
  console.log(`[Scheduler] Executing scheduled GCP scan for project: ${project.name}`);

  const scheduledFor = project.nextScheduledScan || new Date();
  const result = await executeGcpScan(project.id);

  // Log the scan execution
  await logScheduledScan(
    "GCP",
    project.id,
    project.userId,
    scheduledFor,
    result
  );

  // Calculate and update next scheduled scan time
  if (project.scheduleFrequency && project.scheduleHour !== null) {
    const nextScan = calculateNextScanTime(
      project.scheduleFrequency,
      project.scheduleHour,
      project.scheduleDayOfWeek,
      project.scheduleDayOfMonth
    );

    await prisma.gcpProject.update({
      where: { id: project.id },
      data: { nextScheduledScan: nextScan },
    });

    console.log(`[Scheduler] Next GCP scan for ${project.name} scheduled at: ${nextScan.toISOString()}`);
  }
}

/**
 * Process a scheduled Azure scan
 */
async function processAzureScheduledScan(subscription: {
  id: string;
  name: string;
  userId: string;
  scheduleFrequency: string | null;
  scheduleHour: number | null;
  scheduleDayOfWeek: number | null;
  scheduleDayOfMonth: number | null;
  nextScheduledScan: Date | null;
}): Promise<void> {
  console.log(`[Scheduler] Executing scheduled Azure scan for subscription: ${subscription.name}`);

  const scheduledFor = subscription.nextScheduledScan || new Date();
  const result = await executeAzureScan(subscription.id);

  // Log the scan execution
  await logScheduledScan(
    "AZURE",
    subscription.id,
    subscription.userId,
    scheduledFor,
    result
  );

  // Calculate and update next scheduled scan time
  if (subscription.scheduleFrequency && subscription.scheduleHour !== null) {
    const nextScan = calculateNextScanTime(
      subscription.scheduleFrequency,
      subscription.scheduleHour,
      subscription.scheduleDayOfWeek,
      subscription.scheduleDayOfMonth
    );

    await prisma.azureSubscription.update({
      where: { id: subscription.id },
      data: { nextScheduledScan: nextScan },
    });

    console.log(`[Scheduler] Next Azure scan for ${subscription.name} scheduled at: ${nextScan.toISOString()}`);
  }
}

/**
 * Manually trigger a scan for testing purposes
 */
export async function triggerScan(
  cloudProvider: CloudProvider,
  accountId: string
): Promise<{ success: boolean; auditId?: string; error?: string }> {
  switch (cloudProvider) {
    case "AWS":
      return executeAwsScan(accountId);
    case "GCP":
      return executeGcpScan(accountId);
    case "AZURE":
      return executeAzureScan(accountId);
    default:
      return { success: false, error: "Invalid cloud provider" };
  }
}

// Export types
export type { CloudProvider };
