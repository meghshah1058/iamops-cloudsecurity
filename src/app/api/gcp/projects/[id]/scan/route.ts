import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  parseServiceAccountKey,
  getGcpClients,
  type GcpCredentials,
} from "@/lib/gcp/credentials";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface Finding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  resource: string;
  resourceType: string;
  resourcePath?: string;
  region?: string;
  recommendation: string;
}

interface CheckResult {
  findings: Finding[];
  error?: string;
}

// ==================== GCP Security Checks ====================

/**
 * Check 1: IAM - Service accounts with Owner role
 */
async function checkServiceAccountsWithOwnerRole(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    // Note: This requires IAM API access
    // In production, you'd query the IAM API for bindings
    // For now, this is a placeholder that demonstrates the pattern
    findings.push({
      severity: "MEDIUM",
      title: "IAM Policy Review Needed",
      description: "Review IAM policies for service accounts with excessive permissions",
      resource: credentials.projectId,
      resourceType: "IAM Policy",
      region: "global",
      recommendation: "Audit service accounts and remove Owner/Editor roles where not necessary. Use principle of least privilege.",
    });
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 2: Storage - Public buckets
 */
async function checkPublicBuckets(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { storage } = getGcpClients(credentials);
    const [buckets] = await storage.getBuckets();

    for (const bucket of buckets) {
      try {
        const [policy] = await bucket.iam.getPolicy();
        const bindings = policy.bindings || [];

        for (const binding of bindings) {
          if (
            binding.members?.includes("allUsers") ||
            binding.members?.includes("allAuthenticatedUsers")
          ) {
            findings.push({
              severity: "CRITICAL",
              title: "Public Storage Bucket",
              description: `Bucket ${bucket.name} has public access enabled via IAM binding`,
              resource: bucket.name || "unknown",
              resourceType: "Storage Bucket",
              resourcePath: `gs://${bucket.name}`,
              region: bucket.metadata?.location || "unknown",
              recommendation: "Remove public access (allUsers/allAuthenticatedUsers) from bucket IAM policy unless explicitly required.",
            });
          }
        }
      } catch {
        // Skip buckets we can't access
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 3: Storage - Bucket encryption
 */
async function checkBucketEncryption(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { storage } = getGcpClients(credentials);
    const [buckets] = await storage.getBuckets();

    for (const bucket of buckets) {
      const metadata = bucket.metadata;
      if (!metadata?.encryption?.defaultKmsKeyName) {
        findings.push({
          severity: "MEDIUM",
          title: "Bucket Missing Customer-Managed Encryption Key",
          description: `Bucket ${bucket.name} uses Google-managed encryption instead of customer-managed keys`,
          resource: bucket.name || "unknown",
          resourceType: "Storage Bucket",
          resourcePath: `gs://${bucket.name}`,
          region: metadata?.location || "unknown",
          recommendation: "Consider using Customer-Managed Encryption Keys (CMEK) for sensitive data buckets.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 4: Storage - Uniform bucket-level access
 */
async function checkUniformBucketAccess(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { storage } = getGcpClients(credentials);
    const [buckets] = await storage.getBuckets();

    for (const bucket of buckets) {
      const metadata = bucket.metadata;
      if (!metadata?.iamConfiguration?.uniformBucketLevelAccess?.enabled) {
        findings.push({
          severity: "MEDIUM",
          title: "Uniform Bucket-Level Access Disabled",
          description: `Bucket ${bucket.name} does not have uniform bucket-level access enabled`,
          resource: bucket.name || "unknown",
          resourceType: "Storage Bucket",
          resourcePath: `gs://${bucket.name}`,
          region: metadata?.location || "unknown",
          recommendation: "Enable uniform bucket-level access for consistent IAM permissions management.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 5: Storage - Bucket versioning
 */
async function checkBucketVersioning(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { storage } = getGcpClients(credentials);
    const [buckets] = await storage.getBuckets();

    for (const bucket of buckets) {
      const metadata = bucket.metadata;
      if (!metadata?.versioning?.enabled) {
        findings.push({
          severity: "LOW",
          title: "Bucket Versioning Disabled",
          description: `Bucket ${bucket.name} does not have object versioning enabled`,
          resource: bucket.name || "unknown",
          resourceType: "Storage Bucket",
          resourcePath: `gs://${bucket.name}`,
          region: metadata?.location || "unknown",
          recommendation: "Enable versioning on buckets containing important data to protect against accidental deletion.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 6: Compute - Default service account usage
 */
async function checkDefaultServiceAccount(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { compute } = getGcpClients(credentials);
    const [vms] = await compute.getVMs();

    for (const vm of vms) {
      const metadata = vm.metadata;
      const serviceAccounts = metadata?.serviceAccounts || [];

      for (const sa of serviceAccounts) {
        if (sa.email?.includes("compute@developer.gserviceaccount.com")) {
          findings.push({
            severity: "HIGH",
            title: "VM Using Default Service Account",
            description: `VM ${metadata?.name} is using the default Compute Engine service account`,
            resource: metadata?.name || "unknown",
            resourceType: "Compute Instance",
            resourcePath: metadata?.selfLink || undefined,
            region: metadata?.zone?.split("/").pop() || "unknown",
            recommendation: "Create dedicated service accounts for VMs with minimal required permissions.",
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
 * Check 7: Compute - Public IP addresses
 */
async function checkPublicIpAddresses(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { compute } = getGcpClients(credentials);
    const [vms] = await compute.getVMs();

    for (const vm of vms) {
      const metadata = vm.metadata;
      const networkInterfaces = metadata?.networkInterfaces || [];

      for (const iface of networkInterfaces) {
        const accessConfigs = iface.accessConfigs || [];
        for (const config of accessConfigs) {
          if (config.natIP) {
            findings.push({
              severity: "MEDIUM",
              title: "VM Has Public IP Address",
              description: `VM ${metadata?.name} has a public IP address (${config.natIP})`,
              resource: metadata?.name || "unknown",
              resourceType: "Compute Instance",
              resourcePath: metadata?.selfLink || undefined,
              region: metadata?.zone?.split("/").pop() || "unknown",
              recommendation: "Consider using Cloud NAT or a bastion host instead of direct public IPs.",
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
 * Check 8: Compute - Disk encryption
 */
async function checkDiskEncryption(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { compute } = getGcpClients(credentials);
    const [disks] = await compute.getDisks();

    for (const disk of disks) {
      const metadata = disk.metadata;
      if (!metadata?.diskEncryptionKey?.kmsKeyName) {
        findings.push({
          severity: "MEDIUM",
          title: "Disk Using Google-Managed Encryption",
          description: `Disk ${metadata?.name} uses Google-managed encryption instead of CMEK`,
          resource: metadata?.name || "unknown",
          resourceType: "Compute Disk",
          resourcePath: metadata?.selfLink || undefined,
          region: metadata?.zone?.split("/").pop() || "unknown",
          recommendation: "Consider using Customer-Managed Encryption Keys (CMEK) for sensitive disks.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 9: Compute - Serial port enabled
 */
async function checkSerialPortEnabled(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { compute } = getGcpClients(credentials);
    const [vms] = await compute.getVMs();

    for (const vm of vms) {
      const metadata = vm.metadata;
      const metadataItems = metadata?.metadata?.items || [];

      for (const item of metadataItems) {
        if (item.key === "serial-port-enable" && item.value === "true") {
          findings.push({
            severity: "MEDIUM",
            title: "Serial Port Enabled on VM",
            description: `VM ${metadata?.name} has serial port access enabled`,
            resource: metadata?.name || "unknown",
            resourceType: "Compute Instance",
            resourcePath: metadata?.selfLink || undefined,
            region: metadata?.zone?.split("/").pop() || "unknown",
            recommendation: "Disable serial port access unless required for troubleshooting.",
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
 * Check 10: VPC - Firewall rules allowing all ingress
 */
async function checkOpenFirewallRules(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { compute } = getGcpClients(credentials);
    const [firewalls] = await compute.getFirewalls();

    for (const firewall of firewalls) {
      const metadata = firewall.metadata;
      const sourceRanges = metadata?.sourceRanges || [];

      if (
        metadata?.direction === "INGRESS" &&
        sourceRanges.includes("0.0.0.0/0")
      ) {
        const allowed = metadata?.allowed || [];
        for (const rule of allowed) {
          // Check for SSH (22) or RDP (3389) open to the world
          const ports = rule.ports || [];
          if (rule.IPProtocol === "tcp") {
            if (ports.includes("22") || ports.includes("22-22")) {
              findings.push({
                severity: "CRITICAL",
                title: "SSH Open to Internet",
                description: `Firewall rule ${metadata?.name} allows SSH (port 22) from any IP`,
                resource: metadata?.name || "unknown",
                resourceType: "Firewall Rule",
                resourcePath: metadata?.selfLink || undefined,
                region: "global",
                recommendation: "Restrict SSH access to specific IP ranges or use IAP for secure access.",
              });
            }
            if (ports.includes("3389") || ports.includes("3389-3389")) {
              findings.push({
                severity: "CRITICAL",
                title: "RDP Open to Internet",
                description: `Firewall rule ${metadata?.name} allows RDP (port 3389) from any IP`,
                resource: metadata?.name || "unknown",
                resourceType: "Firewall Rule",
                resourcePath: metadata?.selfLink || undefined,
                region: "global",
                recommendation: "Restrict RDP access to specific IP ranges or use IAP for secure access.",
              });
            }
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
 * Check 11: VPC - Flow logs disabled
 */
async function checkVpcFlowLogs(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { compute } = getGcpClients(credentials);
    const [subnetworks] = await compute.getSubnetworks();

    for (const subnet of subnetworks) {
      const metadata = subnet.metadata;
      if (!metadata?.enableFlowLogs) {
        findings.push({
          severity: "MEDIUM",
          title: "VPC Flow Logs Disabled",
          description: `Subnet ${metadata?.name} does not have flow logs enabled`,
          resource: metadata?.name || "unknown",
          resourceType: "VPC Subnet",
          resourcePath: metadata?.selfLink || undefined,
          region: metadata?.region?.split("/").pop() || "unknown",
          recommendation: "Enable VPC flow logs for network traffic analysis and security monitoring.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 12: VPC - Private Google access disabled
 */
async function checkPrivateGoogleAccess(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { compute } = getGcpClients(credentials);
    const [subnetworks] = await compute.getSubnetworks();

    for (const subnet of subnetworks) {
      const metadata = subnet.metadata;
      if (!metadata?.privateIpGoogleAccess) {
        findings.push({
          severity: "LOW",
          title: "Private Google Access Disabled",
          description: `Subnet ${metadata?.name} does not have Private Google Access enabled`,
          resource: metadata?.name || "unknown",
          resourceType: "VPC Subnet",
          resourcePath: metadata?.selfLink || undefined,
          region: metadata?.region?.split("/").pop() || "unknown",
          recommendation: "Enable Private Google Access to allow VMs without external IPs to reach Google APIs.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 13: KMS - Key rotation disabled
 */
async function checkKmsKeyRotation(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { kms } = getGcpClients(credentials);
    const parent = `projects/${credentials.projectId}/locations/-`;

    // List all key rings
    const [keyRings] = await kms.listKeyRings({ parent });

    for (const keyRing of keyRings) {
      const [keys] = await kms.listCryptoKeys({ parent: keyRing.name! });

      for (const key of keys) {
        if (!key.rotationPeriod) {
          findings.push({
            severity: "MEDIUM",
            title: "KMS Key Auto-Rotation Disabled",
            description: `KMS key ${key.name?.split("/").pop()} does not have automatic rotation enabled`,
            resource: key.name?.split("/").pop() || "unknown",
            resourceType: "KMS Key",
            resourcePath: key.name || undefined,
            region: keyRing.name?.split("/")[3] || "unknown",
            recommendation: "Enable automatic key rotation with a rotation period of 90 days or less.",
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
 * Check 14: Logging - Audit logs configuration
 */
async function checkAuditLogsEnabled(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    // Note: Audit log configuration requires Resource Manager API
    // This is a reminder to check audit configuration
    findings.push({
      severity: "LOW",
      title: "Audit Log Configuration Review",
      description: "Verify that Admin Activity, Data Access, and System Event audit logs are properly configured",
      resource: credentials.projectId,
      resourceType: "Audit Configuration",
      region: "global",
      recommendation: "Ensure all audit log types are enabled and exported to a central logging destination.",
    });
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 15: BigQuery - Dataset access review
 */
async function checkBigQueryDatasetAccess(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { bigquery } = getGcpClients(credentials);
    const [datasets] = await bigquery.getDatasets();

    for (const dataset of datasets) {
      const [metadata] = await dataset.getMetadata();
      const access = metadata.access || [];

      for (const entry of access) {
        if (entry.specialGroup === "allAuthenticatedUsers" || entry.iamMember === "allUsers") {
          findings.push({
            severity: "HIGH",
            title: "BigQuery Dataset Publicly Accessible",
            description: `Dataset ${dataset.id} has public or all-authenticated-users access`,
            resource: dataset.id || "unknown",
            resourceType: "BigQuery Dataset",
            resourcePath: `bigquery://${credentials.projectId}/${dataset.id}`,
            region: metadata.location || "unknown",
            recommendation: "Remove public access from BigQuery datasets unless explicitly required.",
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
 * Check 16: Pub/Sub - Topic IAM policies
 */
async function checkPubSubTopicAccess(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { pubsub } = getGcpClients(credentials);
    const [topics] = await pubsub.getTopics();

    for (const topic of topics) {
      try {
        const [policy] = await topic.iam.getPolicy();
        const bindings = policy.bindings || [];

        for (const binding of bindings) {
          if (
            binding.members?.includes("allUsers") ||
            binding.members?.includes("allAuthenticatedUsers")
          ) {
            findings.push({
              severity: "HIGH",
              title: "Pub/Sub Topic Publicly Accessible",
              description: `Topic ${topic.name} has public access in IAM policy`,
              resource: topic.name.split("/").pop() || "unknown",
              resourceType: "Pub/Sub Topic",
              resourcePath: topic.name,
              region: "global",
              recommendation: "Remove public access from Pub/Sub topics unless explicitly required.",
            });
          }
        }
      } catch {
        // Skip topics we can't access
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 17: Secret Manager - Secret rotation
 */
async function checkSecretRotation(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { secretManager } = getGcpClients(credentials);
    const parent = `projects/${credentials.projectId}`;

    const [secrets] = await secretManager.listSecrets({ parent });

    for (const secret of secrets) {
      if (!secret.rotation) {
        findings.push({
          severity: "MEDIUM",
          title: "Secret Rotation Not Configured",
          description: `Secret ${secret.name?.split("/").pop()} does not have automatic rotation configured`,
          resource: secret.name?.split("/").pop() || "unknown",
          resourceType: "Secret",
          resourcePath: secret.name || undefined,
          region: "global",
          recommendation: "Configure automatic rotation for secrets to improve security posture.",
        });
      }
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 18: DNS - DNSSEC review
 */
async function checkDnssec(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  // Note: DNS API requires separate enablement
  findings.push({
    severity: "LOW",
    title: "DNS Security Review",
    description: "Review Cloud DNS zones to ensure DNSSEC is enabled where appropriate",
    resource: credentials.projectId,
    resourceType: "Cloud DNS",
    region: "global",
    recommendation: "Enable DNSSEC on Cloud DNS zones to protect against DNS spoofing attacks.",
  });
  return { findings };
}

/**
 * Check 19: Logging - Log retention review
 */
async function checkLogRetention(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  try {
    const { logging } = getGcpClients(credentials);
    const [sinks] = await logging.getSinks();

    if (sinks.length === 0) {
      findings.push({
        severity: "MEDIUM",
        title: "No Log Sinks Configured",
        description: "No log export sinks are configured for this project",
        resource: credentials.projectId,
        resourceType: "Logging Configuration",
        region: "global",
        recommendation: "Configure log sinks to export logs to Cloud Storage, BigQuery, or Pub/Sub for long-term retention.",
      });
    }
  } catch (error) {
    return { findings, error: String(error) };
  }
  return { findings };
}

/**
 * Check 20: IAM - Service account key age
 */
async function checkServiceAccountKeyAge(
  credentials: GcpCredentials
): Promise<CheckResult> {
  const findings: Finding[] = [];
  // Note: This check would require IAM Admin API
  findings.push({
    severity: "MEDIUM",
    title: "Service Account Key Rotation Review",
    description: "Review service account keys to ensure they are rotated regularly (every 90 days)",
    resource: credentials.projectId,
    resourceType: "IAM Service Account",
    region: "global",
    recommendation: "Implement service account key rotation policy and prefer workload identity where possible.",
  });
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

    // Get the GCP project
    const project = await prisma.gcpProject.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.serviceAccountKey) {
      return NextResponse.json(
        { error: "Service account key not configured" },
        { status: 400 }
      );
    }

    // Parse credentials
    const credentials = parseServiceAccountKey(project.serviceAccountKey);

    // Create audit record
    const audit = await prisma.gcpAudit.create({
      data: {
        projectId: project.id,
        status: "running",
        startedAt: new Date(),
      },
    });

    // Define check phases
    const phases = [
      { name: "IAM Security", checks: [checkServiceAccountsWithOwnerRole, checkServiceAccountKeyAge] },
      { name: "Storage Security", checks: [checkPublicBuckets, checkBucketEncryption, checkUniformBucketAccess, checkBucketVersioning] },
      { name: "Compute Security", checks: [checkDefaultServiceAccount, checkPublicIpAddresses, checkDiskEncryption, checkSerialPortEnabled] },
      { name: "Network Security", checks: [checkOpenFirewallRules, checkVpcFlowLogs, checkPrivateGoogleAccess] },
      { name: "Encryption & KMS", checks: [checkKmsKeyRotation] },
      { name: "Logging & Monitoring", checks: [checkAuditLogsEnabled, checkLogRetention] },
      { name: "Data Services", checks: [checkBigQueryDatasetAccess, checkPubSubTopicAccess, checkSecretRotation, checkDnssec] },
    ];

    const allFindings: Finding[] = [];
    const phaseResults: { name: string; findings: number; critical: number; high: number; medium: number; low: number }[] = [];

    // Execute all checks
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const phaseFindings: Finding[] = [];

      // Create phase record
      const phaseRecord = await prisma.gcpPhase.create({
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
      await prisma.gcpPhase.update({
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
      await prisma.gcpFinding.create({
        data: {
          auditId: audit.id,
          findingId: `gcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          resource: finding.resource,
          resourceType: finding.resourceType,
          resourcePath: finding.resourcePath,
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
    const completedAudit = await prisma.gcpAudit.update({
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

    // Update project
    await prisma.gcpProject.update({
      where: { id: project.id },
      data: {
        lastScanAt: new Date(),
        healthScore: 100 - riskScore,
      },
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
    console.error("GCP scan error:", error);
    return NextResponse.json(
      { error: "Scan failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
