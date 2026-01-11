import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding multi-cloud security database...");

  // Create demo user
  const hashedPassword = await hash("demo123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@cloudguard.io" },
    update: {},
    create: {
      email: "demo@cloudguard.io",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  console.log("Created user:", user.email);

  // ==================== AWS ====================
  const awsAccount = await prisma.awsAccount.upsert({
    where: {
      userId_accountId: {
        userId: user.id,
        accountId: "the5ers-staging",
      },
    },
    update: {
      name: "the5ers-staging",
      lastScanAt: new Date(),
      healthScore: 78,
    },
    create: {
      name: "the5ers-staging",
      accountId: "the5ers-staging",
      region: "eu-central-1",
      userId: user.id,
      isActive: true,
      lastScanAt: new Date(),
      healthScore: 78,
    },
  });

  console.log("Created AWS account:", awsAccount.name);

  const awsAudit = await prisma.awsAudit.create({
    data: {
      accountId: awsAccount.id,
      status: "completed",
      riskScore: 78,
      totalFindings: 47,
      critical: 2,
      high: 8,
      medium: 22,
      low: 15,
      duration: 2340,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 1260000),
    },
  });

  // AWS Phases
  const awsPhases = [
    { number: 1, name: "Identity & Access Management (IAM)", findings: 8, critical: 1, high: 2, medium: 3, low: 2 },
    { number: 2, name: "S3 Security", findings: 5, critical: 0, high: 2, medium: 2, low: 1 },
    { number: 3, name: "Network Security", findings: 6, critical: 1, high: 1, medium: 3, low: 1 },
    { number: 4, name: "Logging & Monitoring", findings: 4, critical: 0, high: 1, medium: 2, low: 1 },
    { number: 5, name: "Compute & Container Security", findings: 3, critical: 0, high: 1, medium: 1, low: 1 },
    { number: 6, name: "Data Services", findings: 2, critical: 0, high: 0, medium: 1, low: 1 },
    { number: 7, name: "Compliance Summary", findings: 1, critical: 0, high: 0, medium: 1, low: 0 },
    { number: 8, name: "Certificate & DNS Security", findings: 2, critical: 0, high: 0, medium: 1, low: 1 },
    { number: 9, name: "API & Application Security", findings: 3, critical: 0, high: 1, medium: 1, low: 1 },
    { number: 10, name: "Secrets & Key Management", findings: 2, critical: 0, high: 0, medium: 1, low: 1 },
  ];

  for (const phase of awsPhases) {
    await prisma.awsPhase.create({
      data: {
        auditId: awsAudit.id,
        phaseNumber: phase.number,
        name: phase.name,
        status: "completed",
        findings: phase.findings,
        critical: phase.critical,
        high: phase.high,
        medium: phase.medium,
        low: phase.low,
        duration: Math.floor(Math.random() * 120) + 30,
      },
    });
  }

  // AWS Findings
  const awsFindings = [
    {
      findingId: "IAM-C01",
      severity: "CRITICAL",
      title: "Root account has no MFA enabled",
      description: "The AWS root account does not have Multi-Factor Authentication (MFA) enabled. Root accounts have unrestricted access to all resources.",
      resource: "Root Account",
      resourceArn: "arn:aws:iam::the5ers-staging:root",
      recommendation: "1. Sign in as root user. 2. Navigate to IAM → Security credentials. 3. Click 'Activate MFA'. 4. Choose hardware or virtual MFA. 5. Complete setup wizard.",
    },
    {
      findingId: "NET-C01",
      severity: "CRITICAL",
      title: "Security group allows 0.0.0.0/0 on SSH (port 22)",
      description: "A security group rule allows SSH access from any IP address, exposing instances to brute force attacks.",
      resource: "sg-07fa47e015e33fb27",
      resourceArn: "arn:aws:ec2:eu-central-1:the5ers-staging:security-group/sg-07fa47e015e33fb27",
      recommendation: "1. Open EC2 Console → Security Groups. 2. Edit inbound rules. 3. Restrict SSH to specific IPs. 4. Consider using AWS SSM Session Manager.",
    },
    {
      findingId: "IAM-H01",
      severity: "HIGH",
      title: "IAM user with full administrator access",
      description: "An IAM user has AdministratorAccess policy attached, granting unrestricted access to all AWS services.",
      resource: "admin-user",
      resourceArn: "arn:aws:iam::the5ers-staging:user/admin-user",
      recommendation: "1. Review CloudTrail logs for actual usage. 2. Create custom policy with required permissions only. 3. Remove AdministratorAccess.",
    },
    {
      findingId: "S3-H01",
      severity: "HIGH",
      title: "S3 bucket without server-side encryption",
      description: "The S3 bucket does not have default encryption enabled. Data at rest is not protected.",
      resource: "the5ers-staging-logs",
      resourceArn: "arn:aws:s3:::the5ers-staging-logs",
      recommendation: "1. Open S3 Console. 2. Select bucket → Properties. 3. Enable default encryption (SSE-S3 or SSE-KMS).",
    },
    {
      findingId: "S3-H02",
      severity: "HIGH",
      title: "S3 bucket public access not blocked",
      description: "Public access block is not enabled, risking accidental data exposure.",
      resource: "the5ers-staging-assets",
      resourceArn: "arn:aws:s3:::the5ers-staging-assets",
      recommendation: "1. Go to S3 bucket → Permissions. 2. Enable all Block Public Access settings. 3. Review bucket policy.",
    },
    {
      findingId: "LOG-H01",
      severity: "HIGH",
      title: "CloudTrail not enabled in all regions",
      description: "CloudTrail is not logging events in all regions, creating audit blind spots.",
      resource: "cloudtrail-main",
      resourceArn: "arn:aws:cloudtrail:eu-central-1:the5ers-staging:trail/cloudtrail-main",
      recommendation: "1. Open CloudTrail Console. 2. Edit trail settings. 3. Enable 'Apply to all regions'.",
    },
    {
      findingId: "RDS-H01",
      severity: "HIGH",
      title: "RDS instance publicly accessible",
      description: "RDS database is configured with public accessibility enabled.",
      resource: "the5ers-staging-db",
      resourceArn: "arn:aws:rds:eu-central-1:the5ers-staging:db:the5ers-staging-db",
      recommendation: "1. Modify RDS instance. 2. Set 'Public access' to No. 3. Use VPN or bastion for access.",
    },
    {
      findingId: "EC2-H01",
      severity: "HIGH",
      title: "EBS volume encryption disabled",
      description: "EBS volume is not encrypted, exposing data if physical media is compromised.",
      resource: "vol-0abc123def456789",
      resourceArn: "arn:aws:ec2:eu-central-1:the5ers-staging:volume/vol-0abc123def456789",
      recommendation: "1. Create encrypted snapshot. 2. Create new encrypted volume. 3. Replace unencrypted volume.",
    },
    {
      findingId: "IAM-M01",
      severity: "MEDIUM",
      title: "IAM password policy allows weak passwords",
      description: "Password policy does not enforce minimum 14 characters and complexity.",
      resource: "Account Password Policy",
      resourceArn: "arn:aws:iam::the5ers-staging:account",
      recommendation: "Configure IAM password policy with strong requirements.",
    },
    {
      findingId: "NET-M01",
      severity: "MEDIUM",
      title: "VPC flow logs not enabled",
      description: "VPC Flow Logs are not enabled for network traffic analysis.",
      resource: "vpc-0123456789abcdef0",
      resourceArn: "arn:aws:ec2:eu-central-1:the5ers-staging:vpc/vpc-0123456789abcdef0",
      recommendation: "Enable VPC Flow Logs to CloudWatch or S3.",
    },
    {
      findingId: "LOG-M01",
      severity: "MEDIUM",
      title: "GuardDuty not enabled",
      description: "Amazon GuardDuty is not enabled for threat detection.",
      resource: "eu-central-1",
      resourceArn: "arn:aws:guardduty:eu-central-1:the5ers-staging",
      recommendation: "Enable GuardDuty for continuous threat monitoring.",
    },
    {
      findingId: "S3-L01",
      severity: "LOW",
      title: "S3 bucket without lifecycle policy",
      description: "No lifecycle policy configured for storage optimization.",
      resource: "the5ers-staging-backups",
      resourceArn: "arn:aws:s3:::the5ers-staging-backups",
      recommendation: "Configure lifecycle policies to optimize storage costs.",
    },
  ];

  for (const finding of awsFindings) {
    await prisma.awsFinding.create({
      data: {
        auditId: awsAudit.id,
        findingId: finding.findingId,
        severity: finding.severity,
        title: finding.title,
        description: finding.description,
        resource: finding.resource,
        resourceArn: finding.resourceArn,
        recommendation: finding.recommendation,
        status: "open",
        region: "eu-central-1",
      },
    });
  }

  console.log("Created AWS audit with findings");

  // ==================== GCP ====================
  const gcpProject = await prisma.gcpProject.upsert({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: "the5ers-prod-gcp",
      },
    },
    update: {
      name: "the5ers-prod",
      lastScanAt: new Date(),
      healthScore: 72,
    },
    create: {
      name: "the5ers-prod",
      projectId: "the5ers-prod-gcp",
      projectNumber: "123456789012",
      region: "us-central1",
      userId: user.id,
      isActive: true,
      lastScanAt: new Date(),
      healthScore: 72,
    },
  });

  console.log("Created GCP project:", gcpProject.name);

  const gcpAudit = await prisma.gcpAudit.create({
    data: {
      projectId: gcpProject.id,
      status: "completed",
      riskScore: 72,
      totalFindings: 38,
      critical: 3,
      high: 7,
      medium: 18,
      low: 10,
      duration: 1980,
      startedAt: new Date(Date.now() - 4800000),
      completedAt: new Date(Date.now() - 2820000),
    },
  });

  // GCP Phases
  const gcpPhases = [
    { number: 1, name: "Identity & Access Management (IAM)", findings: 7, critical: 1, high: 2, medium: 3, low: 1 },
    { number: 2, name: "Cloud Storage Security", findings: 5, critical: 1, high: 1, medium: 2, low: 1 },
    { number: 3, name: "VPC Network Security", findings: 6, critical: 1, high: 1, medium: 3, low: 1 },
    { number: 4, name: "Cloud Logging & Monitoring", findings: 4, critical: 0, high: 1, medium: 2, low: 1 },
    { number: 5, name: "Compute Engine Security", findings: 4, critical: 0, high: 1, medium: 2, low: 1 },
    { number: 6, name: "Cloud SQL & BigQuery", findings: 3, critical: 0, high: 1, medium: 1, low: 1 },
    { number: 7, name: "Kubernetes Engine (GKE)", findings: 4, critical: 0, high: 0, medium: 3, low: 1 },
    { number: 8, name: "Cloud Functions & Run", findings: 2, critical: 0, high: 0, medium: 1, low: 1 },
    { number: 9, name: "Secret Manager & KMS", findings: 2, critical: 0, high: 0, medium: 1, low: 1 },
    { number: 10, name: "API Security", findings: 1, critical: 0, high: 0, medium: 0, low: 1 },
  ];

  for (const phase of gcpPhases) {
    await prisma.gcpPhase.create({
      data: {
        auditId: gcpAudit.id,
        phaseNumber: phase.number,
        name: phase.name,
        status: "completed",
        findings: phase.findings,
        critical: phase.critical,
        high: phase.high,
        medium: phase.medium,
        low: phase.low,
        duration: Math.floor(Math.random() * 100) + 25,
      },
    });
  }

  // GCP Findings
  const gcpFindings = [
    {
      findingId: "GCP-IAM-C01",
      severity: "CRITICAL",
      title: "Service account with Owner role",
      description: "A service account has been granted the Owner role, providing unrestricted access to all project resources. This violates the principle of least privilege.",
      resource: "sa-admin@the5ers-prod-gcp.iam.gserviceaccount.com",
      resourcePath: "projects/the5ers-prod-gcp/serviceAccounts/sa-admin@the5ers-prod-gcp.iam.gserviceaccount.com",
      recommendation: "1. Open IAM Console. 2. Find the service account. 3. Remove Owner role. 4. Assign specific roles needed for the workload.",
    },
    {
      findingId: "GCP-GCS-C01",
      severity: "CRITICAL",
      title: "Cloud Storage bucket publicly accessible",
      description: "A Cloud Storage bucket has allUsers or allAuthenticatedUsers access, exposing data to the public internet.",
      resource: "the5ers-public-assets",
      resourcePath: "gs://the5ers-public-assets",
      recommendation: "1. Open Cloud Storage Console. 2. Select bucket → Permissions. 3. Remove allUsers and allAuthenticatedUsers. 4. Use signed URLs for public access.",
    },
    {
      findingId: "GCP-VPC-C01",
      severity: "CRITICAL",
      title: "Firewall rule allows SSH from 0.0.0.0/0",
      description: "A VPC firewall rule allows SSH (port 22) access from any IP address on the internet.",
      resource: "allow-ssh-all",
      resourcePath: "projects/the5ers-prod-gcp/global/firewalls/allow-ssh-all",
      recommendation: "1. Open VPC Firewall Console. 2. Edit the rule. 3. Restrict source ranges to known IPs. 4. Consider using IAP for SSH.",
    },
    {
      findingId: "GCP-IAM-H01",
      severity: "HIGH",
      title: "User account with primitive role",
      description: "A user account has Editor role at project level, granting broad access to resources.",
      resource: "developer@company.com",
      resourcePath: "projects/the5ers-prod-gcp",
      recommendation: "1. Review user's actual needs. 2. Replace primitive role with predefined roles. 3. Use custom roles if needed.",
    },
    {
      findingId: "GCP-GCS-H01",
      severity: "HIGH",
      title: "Cloud Storage bucket without encryption key management",
      description: "Bucket uses Google-managed encryption keys instead of customer-managed keys (CMEK).",
      resource: "the5ers-sensitive-data",
      resourcePath: "gs://the5ers-sensitive-data",
      recommendation: "1. Create Cloud KMS key. 2. Update bucket to use CMEK. 3. Rotate keys regularly.",
    },
    {
      findingId: "GCP-SQL-H01",
      severity: "HIGH",
      title: "Cloud SQL instance with public IP",
      description: "Cloud SQL instance is accessible via public IP without authorized networks configured.",
      resource: "the5ers-prod-db",
      resourcePath: "projects/the5ers-prod-gcp/instances/the5ers-prod-db",
      recommendation: "1. Configure authorized networks. 2. Use Cloud SQL Proxy. 3. Consider private IP only.",
    },
    {
      findingId: "GCP-LOG-H01",
      severity: "HIGH",
      title: "Audit logging not enabled for all services",
      description: "Data access audit logs are not enabled for critical services like Cloud Storage and BigQuery.",
      resource: "Project Audit Config",
      resourcePath: "projects/the5ers-prod-gcp",
      recommendation: "1. Open IAM → Audit Logs. 2. Enable Data Read and Data Write logs. 3. Configure log exports.",
    },
    {
      findingId: "GCP-GCE-H01",
      severity: "HIGH",
      title: "Compute instance with default service account",
      description: "VM instances are using the default compute service account with broad permissions.",
      resource: "web-server-1",
      resourcePath: "projects/the5ers-prod-gcp/zones/us-central1-a/instances/web-server-1",
      recommendation: "1. Create dedicated service account. 2. Assign minimal required roles. 3. Update instance to use new SA.",
    },
    {
      findingId: "GCP-VPC-M01",
      severity: "MEDIUM",
      title: "VPC Flow Logs not enabled",
      description: "VPC subnets do not have flow logs enabled for network traffic analysis.",
      resource: "default-subnet",
      resourcePath: "projects/the5ers-prod-gcp/regions/us-central1/subnetworks/default",
      recommendation: "Enable VPC Flow Logs on all subnets for security monitoring.",
    },
    {
      findingId: "GCP-GKE-M01",
      severity: "MEDIUM",
      title: "GKE cluster without network policy",
      description: "Kubernetes cluster does not have network policy enforcement enabled.",
      resource: "the5ers-gke-cluster",
      resourcePath: "projects/the5ers-prod-gcp/locations/us-central1/clusters/the5ers-gke-cluster",
      recommendation: "Enable network policy and define pod-to-pod communication rules.",
    },
    {
      findingId: "GCP-GKE-M02",
      severity: "MEDIUM",
      title: "GKE nodes using default service account",
      description: "GKE nodes are using the default compute service account.",
      resource: "the5ers-gke-cluster",
      resourcePath: "projects/the5ers-prod-gcp/locations/us-central1/clusters/the5ers-gke-cluster",
      recommendation: "Create dedicated service account for GKE nodes with minimal permissions.",
    },
    {
      findingId: "GCP-KMS-L01",
      severity: "LOW",
      title: "KMS keys without rotation schedule",
      description: "Customer-managed encryption keys do not have automatic rotation enabled.",
      resource: "app-encryption-key",
      resourcePath: "projects/the5ers-prod-gcp/locations/global/keyRings/app-keys/cryptoKeys/app-encryption-key",
      recommendation: "Enable automatic key rotation with appropriate rotation period.",
    },
  ];

  for (const finding of gcpFindings) {
    await prisma.gcpFinding.create({
      data: {
        auditId: gcpAudit.id,
        findingId: finding.findingId,
        severity: finding.severity,
        title: finding.title,
        description: finding.description,
        resource: finding.resource,
        resourcePath: finding.resourcePath,
        recommendation: finding.recommendation,
        status: "open",
        region: "us-central1",
      },
    });
  }

  console.log("Created GCP audit with findings");

  // ==================== AZURE ====================
  const azureSubscription = await prisma.azureSubscription.upsert({
    where: {
      userId_subscriptionId: {
        userId: user.id,
        subscriptionId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      },
    },
    update: {
      name: "the5ers-azure-prod",
      lastScanAt: new Date(),
      healthScore: 75,
    },
    create: {
      name: "the5ers-azure-prod",
      subscriptionId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      tenantId: "tenant-12345",
      region: "eastus",
      userId: user.id,
      isActive: true,
      lastScanAt: new Date(),
      healthScore: 75,
    },
  });

  console.log("Created Azure subscription:", azureSubscription.name);

  const azureAudit = await prisma.azureAudit.create({
    data: {
      subscriptionId: azureSubscription.id,
      status: "completed",
      riskScore: 75,
      totalFindings: 42,
      critical: 2,
      high: 9,
      medium: 20,
      low: 11,
      duration: 2100,
      startedAt: new Date(Date.now() - 5400000),
      completedAt: new Date(Date.now() - 3300000),
    },
  });

  // Azure Phases
  const azurePhases = [
    { number: 1, name: "Azure Active Directory (Entra ID)", findings: 6, critical: 1, high: 2, medium: 2, low: 1 },
    { number: 2, name: "Blob Storage Security", findings: 5, critical: 0, high: 2, medium: 2, low: 1 },
    { number: 3, name: "Virtual Network Security", findings: 6, critical: 1, high: 1, medium: 3, low: 1 },
    { number: 4, name: "Azure Monitor & Logging", findings: 4, critical: 0, high: 1, medium: 2, low: 1 },
    { number: 5, name: "Virtual Machine Security", findings: 5, critical: 0, high: 1, medium: 3, low: 1 },
    { number: 6, name: "Azure SQL & Cosmos DB", findings: 4, critical: 0, high: 1, medium: 2, low: 1 },
    { number: 7, name: "Azure Kubernetes Service (AKS)", findings: 4, critical: 0, high: 1, medium: 2, low: 1 },
    { number: 8, name: "App Service & Functions", findings: 3, critical: 0, high: 0, medium: 2, low: 1 },
    { number: 9, name: "Key Vault & Secrets", findings: 3, critical: 0, high: 0, medium: 1, low: 2 },
    { number: 10, name: "Azure Policy & Compliance", findings: 2, critical: 0, high: 0, medium: 1, low: 1 },
  ];

  for (const phase of azurePhases) {
    await prisma.azurePhase.create({
      data: {
        auditId: azureAudit.id,
        phaseNumber: phase.number,
        name: phase.name,
        status: "completed",
        findings: phase.findings,
        critical: phase.critical,
        high: phase.high,
        medium: phase.medium,
        low: phase.low,
        duration: Math.floor(Math.random() * 110) + 28,
      },
    });
  }

  // Azure Findings
  const azureFindings = [
    {
      findingId: "AZ-AAD-C01",
      severity: "CRITICAL",
      title: "Global Administrator without MFA",
      description: "A user with Global Administrator role does not have Multi-Factor Authentication enabled, risking complete tenant compromise.",
      resource: "admin@the5ers.onmicrosoft.com",
      resourceId: "/users/admin@the5ers.onmicrosoft.com",
      recommendation: "1. Open Azure AD → Users. 2. Select the admin user. 3. Enable MFA in Authentication methods. 4. Enforce Conditional Access policy.",
    },
    {
      findingId: "AZ-NSG-C01",
      severity: "CRITICAL",
      title: "NSG allows RDP from internet (0.0.0.0/0)",
      description: "Network Security Group allows Remote Desktop Protocol (port 3389) access from any IP address.",
      resource: "web-servers-nsg",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg/providers/Microsoft.Network/networkSecurityGroups/web-servers-nsg",
      recommendation: "1. Open NSG in Azure Portal. 2. Edit inbound rule for RDP. 3. Restrict source to specific IPs. 4. Consider Azure Bastion.",
    },
    {
      findingId: "AZ-AAD-H01",
      severity: "HIGH",
      title: "Service principal with Owner role on subscription",
      description: "A service principal has been granted Owner role at subscription level, providing excessive permissions.",
      resource: "sp-deployment-automation",
      resourceId: "/subscriptions/a1b2c3d4/providers/Microsoft.Authorization/roleAssignments/xyz",
      recommendation: "1. Review service principal usage. 2. Assign Contributor or custom role. 3. Remove Owner role assignment.",
    },
    {
      findingId: "AZ-STOR-H01",
      severity: "HIGH",
      title: "Storage account allows public blob access",
      description: "Storage account is configured to allow anonymous public access to blobs.",
      resource: "the5ersstorage",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg/providers/Microsoft.Storage/storageAccounts/the5ersstorage",
      recommendation: "1. Open Storage Account → Configuration. 2. Set 'Allow Blob public access' to Disabled. 3. Use SAS tokens for access.",
    },
    {
      findingId: "AZ-STOR-H02",
      severity: "HIGH",
      title: "Storage account without infrastructure encryption",
      description: "Storage account does not have infrastructure encryption (double encryption) enabled.",
      resource: "the5erssensitive",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg/providers/Microsoft.Storage/storageAccounts/the5erssensitive",
      recommendation: "1. Create new storage account with infrastructure encryption. 2. Migrate data. 3. Delete old account.",
    },
    {
      findingId: "AZ-SQL-H01",
      severity: "HIGH",
      title: "Azure SQL with firewall rule 0.0.0.0-255.255.255.255",
      description: "SQL Database has a firewall rule allowing access from all Azure services and all internet IPs.",
      resource: "the5ers-sql-server",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg/providers/Microsoft.Sql/servers/the5ers-sql-server",
      recommendation: "1. Remove 'Allow Azure services' rule. 2. Add specific client IP ranges. 3. Use Private Endpoints.",
    },
    {
      findingId: "AZ-VM-H01",
      severity: "HIGH",
      title: "VM disk encryption not using customer-managed keys",
      description: "Virtual machine OS and data disks are encrypted with platform-managed keys instead of CMK.",
      resource: "web-server-vm",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg/providers/Microsoft.Compute/virtualMachines/web-server-vm",
      recommendation: "1. Create Key Vault with encryption key. 2. Create Disk Encryption Set. 3. Update VM disks to use CMK.",
    },
    {
      findingId: "AZ-LOG-H01",
      severity: "HIGH",
      title: "Activity Log not exported to Log Analytics",
      description: "Azure Activity Logs are not being sent to Log Analytics workspace for long-term retention and analysis.",
      resource: "Subscription Activity Log",
      resourceId: "/subscriptions/a1b2c3d4/providers/Microsoft.Insights/diagnosticSettings",
      recommendation: "1. Open Monitor → Activity Log. 2. Click Diagnostic settings. 3. Configure export to Log Analytics.",
    },
    {
      findingId: "AZ-AKS-H01",
      severity: "HIGH",
      title: "AKS cluster API server publicly accessible",
      description: "Azure Kubernetes Service cluster has public API server access enabled without authorized IP ranges.",
      resource: "the5ers-aks-cluster",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg/providers/Microsoft.ContainerService/managedClusters/the5ers-aks-cluster",
      recommendation: "1. Configure authorized IP ranges. 2. Consider private cluster. 3. Enable Azure AD integration.",
    },
    {
      findingId: "AZ-VNET-M01",
      severity: "MEDIUM",
      title: "NSG Flow Logs not enabled",
      description: "Network Security Group flow logs are not enabled for network traffic analysis.",
      resource: "app-servers-nsg",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg/providers/Microsoft.Network/networkSecurityGroups/app-servers-nsg",
      recommendation: "Enable NSG Flow Logs and configure storage account for retention.",
    },
    {
      findingId: "AZ-KV-M01",
      severity: "MEDIUM",
      title: "Key Vault without soft delete enabled",
      description: "Key Vault does not have soft delete enabled, risking permanent data loss.",
      resource: "the5ers-keyvault",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg/providers/Microsoft.KeyVault/vaults/the5ers-keyvault",
      recommendation: "Enable soft delete and purge protection on Key Vault.",
    },
    {
      findingId: "AZ-APP-M01",
      severity: "MEDIUM",
      title: "App Service without HTTPS-only",
      description: "App Service allows HTTP connections instead of enforcing HTTPS.",
      resource: "the5ers-webapp",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg/providers/Microsoft.Web/sites/the5ers-webapp",
      recommendation: "Enable 'HTTPS Only' in App Service TLS/SSL settings.",
    },
    {
      findingId: "AZ-POL-L01",
      severity: "LOW",
      title: "Resource group without resource locks",
      description: "Production resource group does not have Delete lock to prevent accidental deletion.",
      resource: "prod-rg",
      resourceId: "/subscriptions/a1b2c3d4/resourceGroups/prod-rg",
      recommendation: "Add CanNotDelete lock to production resource groups.",
    },
  ];

  for (const finding of azureFindings) {
    await prisma.azureFinding.create({
      data: {
        auditId: azureAudit.id,
        findingId: finding.findingId,
        severity: finding.severity,
        title: finding.title,
        description: finding.description,
        resource: finding.resource,
        resourceId: finding.resourceId,
        recommendation: finding.recommendation,
        status: "open",
        region: "eastus",
      },
    });
  }

  console.log("Created Azure audit with findings");

  console.log("\n✅ Multi-cloud seeding complete!");
  console.log("\nLogin credentials:");
  console.log("  Email: demo@cloudguard.io");
  console.log("  Password: demo123");
  console.log("\nCloud accounts created:");
  console.log("  - AWS: the5ers-staging (47 findings)");
  console.log("  - GCP: the5ers-prod (38 findings)");
  console.log("  - Azure: the5ers-azure-prod (42 findings)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
