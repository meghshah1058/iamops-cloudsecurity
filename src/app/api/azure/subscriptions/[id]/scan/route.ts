import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getAzureClients,
  type AzureCredentials,
} from "@/lib/azure/credentials";
import { sendAuditAlerts } from "@/lib/scheduler/scan-executor";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface Finding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  resource: string;
  resourceType: string;
  resourceId?: string;
  region?: string;
  recommendation: string;
}

interface CheckResult {
  findings: Finding[];
  error?: string;
}

// ==================== Azure Security Checks ====================

/**
 * Check 1: Storage - Public blob access
 */
async function checkPublicBlobAccess(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { storage } = getAzureClients(credentials);
    const accounts = storage.storageAccounts.list();

    for await (const account of accounts) {
      if (account.allowBlobPublicAccess === true) {
        findings.push({
          severity: "HIGH",
          title: "Public Blob Access Enabled",
          description: `Storage account ${account.name} allows public blob access`,
          resource: account.name || "unknown",
          resourceType: "Storage Account",
          resourceId: account.id,
          region: account.location,
          recommendation: "Disable public blob access unless explicitly required for public content.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 2: Storage - HTTPS only
 */
async function checkStorageHttpsOnly(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { storage } = getAzureClients(credentials);
    const accounts = storage.storageAccounts.list();

    for await (const account of accounts) {
      if (account.enableHttpsTrafficOnly === false) {
        findings.push({
          severity: "HIGH",
          title: "HTTPS Not Enforced on Storage Account",
          description: `Storage account ${account.name} allows non-HTTPS traffic`,
          resource: account.name || "unknown",
          resourceType: "Storage Account",
          resourceId: account.id,
          region: account.location,
          recommendation: "Enable 'Secure transfer required' to enforce HTTPS connections.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 3: Storage - Soft delete for blobs
 */
async function checkBlobSoftDelete(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { storage } = getAzureClients(credentials);
    const accounts = storage.storageAccounts.list();

    for await (const account of accounts) {
      if (account.name) {
        try {
          const props = await storage.blobServices.getServiceProperties(
            account.name.split("/").pop() || "",
            account.name
          );
          if (!props.deleteRetentionPolicy?.enabled) {
            findings.push({
              severity: "MEDIUM",
              title: "Blob Soft Delete Disabled",
              description: `Storage account ${account.name} does not have soft delete enabled for blobs`,
              resource: account.name,
              resourceType: "Storage Account",
              resourceId: account.id,
              region: account.location,
              recommendation: "Enable soft delete for blobs to protect against accidental deletion.",
            });
          }
        } catch {
          // Skip if we can't access blob service properties
        }
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 4: Compute - Disk encryption
 */
async function checkDiskEncryption(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { compute } = getAzureClients(credentials);
    const disks = compute.disks.list();

    for await (const disk of disks) {
      if (!disk.encryption?.type || disk.encryption.type === "EncryptionAtRestWithPlatformKey") {
        findings.push({
          severity: "MEDIUM",
          title: "Disk Using Platform-Managed Key",
          description: `Disk ${disk.name} uses platform-managed encryption instead of customer-managed keys`,
          resource: disk.name || "unknown",
          resourceType: "Managed Disk",
          resourceId: disk.id,
          region: disk.location,
          recommendation: "Consider using customer-managed keys (CMK) for sensitive disks.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 5: Compute - VM managed identity
 */
async function checkVmManagedIdentity(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { compute } = getAzureClients(credentials);
    const vms = compute.virtualMachines.listAll();

    for await (const vm of vms) {
      if (!vm.identity) {
        findings.push({
          severity: "LOW",
          title: "VM Without Managed Identity",
          description: `VM ${vm.name} does not have a managed identity configured`,
          resource: vm.name || "unknown",
          resourceType: "Virtual Machine",
          resourceId: vm.id,
          region: vm.location,
          recommendation: "Use managed identities for Azure resources to eliminate credential management.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 6: Network - NSG rules allowing SSH from internet
 */
async function checkNsgSshOpen(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { network } = getAzureClients(credentials);
    const nsgs = network.networkSecurityGroups.listAll();

    for await (const nsg of nsgs) {
      const rules = nsg.securityRules || [];
      for (const rule of rules) {
        if (
          rule.direction === "Inbound" &&
          rule.access === "Allow" &&
          (rule.destinationPortRange === "22" || rule.destinationPortRange === "*") &&
          (rule.sourceAddressPrefix === "*" || rule.sourceAddressPrefix === "Internet")
        ) {
          findings.push({
            severity: "CRITICAL",
            title: "SSH Open to Internet",
            description: `NSG ${nsg.name} allows SSH (port 22) from the internet`,
            resource: nsg.name || "unknown",
            resourceType: "Network Security Group",
            resourceId: nsg.id,
            region: nsg.location,
            recommendation: "Restrict SSH access to specific IP ranges or use Azure Bastion.",
          });
        }
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 7: Network - NSG rules allowing RDP from internet
 */
async function checkNsgRdpOpen(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { network } = getAzureClients(credentials);
    const nsgs = network.networkSecurityGroups.listAll();

    for await (const nsg of nsgs) {
      const rules = nsg.securityRules || [];
      for (const rule of rules) {
        if (
          rule.direction === "Inbound" &&
          rule.access === "Allow" &&
          (rule.destinationPortRange === "3389" || rule.destinationPortRange === "*") &&
          (rule.sourceAddressPrefix === "*" || rule.sourceAddressPrefix === "Internet")
        ) {
          findings.push({
            severity: "CRITICAL",
            title: "RDP Open to Internet",
            description: `NSG ${nsg.name} allows RDP (port 3389) from the internet`,
            resource: nsg.name || "unknown",
            resourceType: "Network Security Group",
            resourceId: nsg.id,
            region: nsg.location,
            recommendation: "Restrict RDP access to specific IP ranges or use Azure Bastion.",
          });
        }
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 8: Network - NSG flow logs
 */
async function checkNsgFlowLogs(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { network } = getAzureClients(credentials);
    const nsgs = network.networkSecurityGroups.listAll();

    for await (const nsg of nsgs) {
      // Note: Flow logs require Network Watcher API
      // This is a simplified check
      findings.push({
        severity: "MEDIUM",
        title: "NSG Flow Logs Review Needed",
        description: `Verify flow logs are enabled for NSG ${nsg.name}`,
        resource: nsg.name || "unknown",
        resourceType: "Network Security Group",
        resourceId: nsg.id,
        region: nsg.location,
        recommendation: "Enable NSG flow logs for network traffic analysis and security monitoring.",
      });
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 9: SQL - Firewall allows all Azure services
 */
async function checkSqlFirewall(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { sql } = getAzureClients(credentials);
    const servers = sql.servers.list();

    for await (const server of servers) {
      if (server.name) {
        const resourceGroup = server.id?.split("/")[4] || "";
        const firewallRules = sql.firewallRules.listByServer(resourceGroup, server.name);

        for await (const rule of firewallRules) {
          if (rule.startIpAddress === "0.0.0.0" && rule.endIpAddress === "0.0.0.0") {
            findings.push({
              severity: "HIGH",
              title: "SQL Server Allows All Azure Services",
              description: `SQL Server ${server.name} allows connections from all Azure services`,
              resource: server.name,
              resourceType: "SQL Server",
              resourceId: server.id,
              region: server.location,
              recommendation: "Restrict firewall rules to specific IP ranges or virtual networks.",
            });
          }
          if (rule.startIpAddress === "0.0.0.0" && rule.endIpAddress === "255.255.255.255") {
            findings.push({
              severity: "CRITICAL",
              title: "SQL Server Open to Internet",
              description: `SQL Server ${server.name} allows connections from any IP address`,
              resource: server.name,
              resourceType: "SQL Server",
              resourceId: server.id,
              region: server.location,
              recommendation: "Restrict firewall rules to specific IP ranges.",
            });
          }
        }
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 10: SQL - Transparent Data Encryption
 */
async function checkSqlTde(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { sql } = getAzureClients(credentials);
    const servers = sql.servers.list();

    for await (const server of servers) {
      if (server.name) {
        const resourceGroup = server.id?.split("/")[4] || "";
        const databases = sql.databases.listByServer(resourceGroup, server.name);

        for await (const db of databases) {
          if (db.name && db.name !== "master") {
            // TDE is enabled by default for Azure SQL Database
            // Check for customer-managed keys
            findings.push({
              severity: "LOW",
              title: "SQL Database TDE Review",
              description: `Review TDE configuration for database ${db.name} on ${server.name}`,
              resource: `${server.name}/${db.name}`,
              resourceType: "SQL Database",
              resourceId: db.id,
              region: server.location,
              recommendation: "Consider using customer-managed keys for TDE encryption.",
            });
          }
        }
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 11: SQL - Auditing enabled
 */
async function checkSqlAuditing(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { sql } = getAzureClients(credentials);
    const servers = sql.servers.list();

    for await (const server of servers) {
      findings.push({
        severity: "MEDIUM",
        title: "SQL Server Auditing Review",
        description: `Verify auditing is enabled for SQL Server ${server.name}`,
        resource: server.name || "unknown",
        resourceType: "SQL Server",
        resourceId: server.id,
        region: server.location,
        recommendation: "Enable auditing to track database activities and security events.",
      });
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 12: Key Vault - Soft delete enabled
 */
async function checkKeyVaultSoftDelete(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { keyVault } = getAzureClients(credentials);
    const vaults = keyVault.vaults.list();

    for await (const vault of vaults) {
      if (vault.properties && !vault.properties.enableSoftDelete) {
        findings.push({
          severity: "HIGH",
          title: "Key Vault Soft Delete Disabled",
          description: `Key Vault ${vault.name} does not have soft delete enabled`,
          resource: vault.name || "unknown",
          resourceType: "Key Vault",
          resourceId: vault.id,
          region: vault.location,
          recommendation: "Enable soft delete to protect against accidental key vault deletion.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 13: Key Vault - Purge protection enabled
 */
async function checkKeyVaultPurgeProtection(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { keyVault } = getAzureClients(credentials);
    const vaults = keyVault.vaults.list();

    for await (const vault of vaults) {
      if (vault.properties && !vault.properties.enablePurgeProtection) {
        findings.push({
          severity: "MEDIUM",
          title: "Key Vault Purge Protection Disabled",
          description: `Key Vault ${vault.name} does not have purge protection enabled`,
          resource: vault.name || "unknown",
          resourceType: "Key Vault",
          resourceId: vault.id,
          region: vault.location,
          recommendation: "Enable purge protection to prevent permanent deletion during retention period.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 14: AKS - RBAC enabled
 */
async function checkAksRbac(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { containerService } = getAzureClients(credentials);
    const clusters = containerService.managedClusters.list();

    for await (const cluster of clusters) {
      if (!cluster.enableRBAC) {
        findings.push({
          severity: "HIGH",
          title: "AKS RBAC Disabled",
          description: `AKS cluster ${cluster.name} does not have RBAC enabled`,
          resource: cluster.name || "unknown",
          resourceType: "AKS Cluster",
          resourceId: cluster.id,
          region: cluster.location,
          recommendation: "Enable Kubernetes RBAC for proper access control.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 15: AKS - Network policies
 */
async function checkAksNetworkPolicies(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { containerService } = getAzureClients(credentials);
    const clusters = containerService.managedClusters.list();

    for await (const cluster of clusters) {
      if (!cluster.networkProfile?.networkPolicy) {
        findings.push({
          severity: "MEDIUM",
          title: "AKS Network Policies Not Configured",
          description: `AKS cluster ${cluster.name} does not have network policies configured`,
          resource: cluster.name || "unknown",
          resourceType: "AKS Cluster",
          resourceId: cluster.id,
          region: cluster.location,
          recommendation: "Enable network policies (Azure or Calico) for pod network segmentation.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 16: App Service - HTTPS only
 */
async function checkAppServiceHttps(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { appService } = getAzureClients(credentials);
    const apps = appService.webApps.list();

    for await (const app of apps) {
      if (!app.httpsOnly) {
        findings.push({
          severity: "HIGH",
          title: "App Service HTTPS Not Enforced",
          description: `App Service ${app.name} does not enforce HTTPS`,
          resource: app.name || "unknown",
          resourceType: "App Service",
          resourceId: app.id,
          region: app.location,
          recommendation: "Enable HTTPS Only to redirect all HTTP traffic to HTTPS.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 17: App Service - Managed identity
 */
async function checkAppServiceManagedIdentity(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { appService } = getAzureClients(credentials);
    const apps = appService.webApps.list();

    for await (const app of apps) {
      if (!app.identity) {
        findings.push({
          severity: "LOW",
          title: "App Service Without Managed Identity",
          description: `App Service ${app.name} does not have a managed identity`,
          resource: app.name || "unknown",
          resourceType: "App Service",
          resourceId: app.id,
          region: app.location,
          recommendation: "Use managed identities for secure access to Azure resources.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 18: Cosmos DB - Firewall rules
 */
async function checkCosmosDbFirewall(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { cosmosDb } = getAzureClients(credentials);
    const accounts = cosmosDb.databaseAccounts.list();

    for await (const account of accounts) {
      if (account.isVirtualNetworkFilterEnabled === false &&
          (!account.ipRules || account.ipRules.length === 0)) {
        findings.push({
          severity: "HIGH",
          title: "Cosmos DB No Network Restrictions",
          description: `Cosmos DB ${account.name} has no firewall or virtual network restrictions`,
          resource: account.name || "unknown",
          resourceType: "Cosmos DB Account",
          resourceId: account.id,
          region: account.location,
          recommendation: "Configure firewall rules or virtual network service endpoints.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 19: Monitor - Activity log alerts
 */
async function checkActivityLogAlerts(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    findings.push({
      severity: "MEDIUM",
      title: "Activity Log Alert Review",
      description: "Review activity log alert rules for critical security events",
      resource: credentials.subscriptionId,
      resourceType: "Subscription",
      region: "global",
      recommendation: "Configure activity log alerts for security-critical operations like policy changes, role assignments, and resource deletions.",
    });
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 20: Monitor - Diagnostic settings
 */
async function checkDiagnosticSettings(
  credentials: AzureCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    findings.push({
      severity: "MEDIUM",
      title: "Diagnostic Settings Review",
      description: "Review diagnostic settings for critical Azure resources",
      resource: credentials.subscriptionId,
      resourceType: "Subscription",
      region: "global",
      recommendation: "Enable diagnostic settings to export logs to Log Analytics, Storage Account, or Event Hub.",
    });
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

// ==================== Main Scan Handler ====================

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the Azure subscription
    const subscription = await prisma.azureSubscription.findFirst({
      where: { id, userId: user.id },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (!subscription.tenantId || !subscription.clientId || !subscription.clientSecret) {
      return NextResponse.json(
        { error: "Service principal credentials not configured" },
        { status: 400 }
      );
    }

    // Create credentials object
    const credentials: AzureCredentials = {
      subscriptionId: subscription.subscriptionId,
      tenantId: subscription.tenantId,
      clientId: subscription.clientId,
      clientSecret: subscription.clientSecret,
    };

    // Create audit record
    const audit = await prisma.azureAudit.create({
      data: {
        subscriptionId: subscription.id,
        status: "running",
        startedAt: new Date(),
      },
    });

    // Define check phases
    const phases = [
      { name: "Storage Security", checks: [checkPublicBlobAccess, checkStorageHttpsOnly, checkBlobSoftDelete] },
      { name: "Compute Security", checks: [checkDiskEncryption, checkVmManagedIdentity] },
      { name: "Network Security", checks: [checkNsgSshOpen, checkNsgRdpOpen, checkNsgFlowLogs] },
      { name: "SQL Security", checks: [checkSqlFirewall, checkSqlTde, checkSqlAuditing] },
      { name: "Key Vault Security", checks: [checkKeyVaultSoftDelete, checkKeyVaultPurgeProtection] },
      { name: "AKS Security", checks: [checkAksRbac, checkAksNetworkPolicies] },
      { name: "App Service Security", checks: [checkAppServiceHttps, checkAppServiceManagedIdentity] },
      { name: "Data Services", checks: [checkCosmosDbFirewall] },
      { name: "Monitoring & Logging", checks: [checkActivityLogAlerts, checkDiagnosticSettings] },
    ];

    const allFindings: Finding[] = [];
    const phaseResults: { name: string; findings: number; critical: number; high: number; medium: number; low: number }[] = [];

    // Execute all checks
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const phaseFindings: Finding[] = [];

      // Create phase record
      const phaseRecord = await prisma.azurePhase.create({
        data: {
          auditId: audit.id,
          phaseNumber: i + 1,
          name: phase.name,
          status: "running",
          startedAt: new Date(),
        },
      });

      for (const check of phase.checks) {
        try {
          const result = await check(credentials);
          phaseFindings.push(...result.findings);
        } catch (error) {
          console.error(`Error in check for phase ${phase.name}:`, error);
        }
      }

      // Count severities
      const critical = phaseFindings.filter((f) => f.severity === "CRITICAL").length;
      const high = phaseFindings.filter((f) => f.severity === "HIGH").length;
      const medium = phaseFindings.filter((f) => f.severity === "MEDIUM").length;
      const low = phaseFindings.filter((f) => f.severity === "LOW").length;

      // Update phase record
      await prisma.azurePhase.update({
        where: { id: phaseRecord.id },
        data: {
          status: "completed",
          findings: phaseFindings.length,
          critical,
          high,
          medium,
          low,
          completedAt: new Date(),
        },
      });

      phaseResults.push({ name: phase.name, findings: phaseFindings.length, critical, high, medium, low });
      allFindings.push(...phaseFindings);
    }

    // Create finding records
    for (const finding of allFindings) {
      await prisma.azureFinding.create({
        data: {
          auditId: audit.id,
          findingId: `azure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          resource: finding.resource,
          resourceType: finding.resourceType,
          resourceId: finding.resourceId,
          region: finding.region,
          recommendation: finding.recommendation,
        },
      });
    }

    // Calculate totals
    const totalCritical = allFindings.filter((f) => f.severity === "CRITICAL").length;
    const totalHigh = allFindings.filter((f) => f.severity === "HIGH").length;
    const totalMedium = allFindings.filter((f) => f.severity === "MEDIUM").length;
    const totalLow = allFindings.filter((f) => f.severity === "LOW").length;

    // Calculate risk score (0-100, lower is better)
    const riskScore = Math.min(
      100,
      totalCritical * 25 + totalHigh * 10 + totalMedium * 3 + totalLow * 1
    );

    // Update audit record
    const completedAudit = await prisma.azureAudit.update({
      where: { id: audit.id },
      data: {
        status: "completed",
        totalFindings: allFindings.length,
        critical: totalCritical,
        high: totalHigh,
        medium: totalMedium,
        low: totalLow,
        riskScore,
        completedAt: new Date(),
        duration: Date.now() - audit.startedAt!.getTime(),
      },
    });

    // Update subscription
    await prisma.azureSubscription.update({
      where: { id: subscription.id },
      data: {
        lastScanAt: new Date(),
        healthScore: 100 - riskScore,
      },
    });

    // Send alerts for completed scan
    await sendAuditAlerts(user.id, "AZURE", subscription.name, {
      critical: totalCritical,
      high: totalHigh,
      medium: totalMedium,
      low: totalLow,
      total: allFindings.length,
    });

    return NextResponse.json({
      success: true,
      auditId: completedAudit.id,
      summary: {
        total: allFindings.length,
        critical: totalCritical,
        high: totalHigh,
        medium: totalMedium,
        low: totalLow,
        riskScore,
      },
      phases: phaseResults,
    });
  } catch (error) {
    console.error("Azure scan error:", error);
    return NextResponse.json(
      { error: "Scan failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
