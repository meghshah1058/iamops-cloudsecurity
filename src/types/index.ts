// Severity types
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// Audit status types
export type AuditStatus = "pending" | "running" | "completed" | "failed";

// Phase status types
export type PhaseStatus = "pending" | "running" | "completed" | "failed" | "skipped";

// Finding status types
export type FindingStatus = "open" | "resolved" | "ignored" | "false_positive";

// Audit phase definitions
export interface AuditPhase {
  number: number;
  name: string;
  description: string;
  checks: number;
  category: string;
}

// 25 Audit Phases
export const AUDIT_PHASES: AuditPhase[] = [
  { number: 1, name: "Identity & Access Management (IAM)", description: "IAM users, roles, policies, MFA, password policies", checks: 15, category: "Identity" },
  { number: 2, name: "S3 Security", description: "Bucket policies, encryption, public access, versioning", checks: 12, category: "Storage" },
  { number: 3, name: "Network Security", description: "VPCs, security groups, NACLs, flow logs", checks: 15, category: "Network" },
  { number: 4, name: "Logging & Monitoring", description: "CloudTrail, CloudWatch, GuardDuty, Config", checks: 12, category: "Monitoring" },
  { number: 5, name: "Compute & Container Security", description: "EC2, ECS, EKS, Lambda security", checks: 15, category: "Compute" },
  { number: 6, name: "Data Services", description: "RDS, DynamoDB, ElastiCache encryption and access", checks: 12, category: "Database" },
  { number: 7, name: "Compliance Summary", description: "Overall compliance posture summary", checks: 5, category: "Compliance" },
  { number: 8, name: "Certificate & DNS Security", description: "ACM, Route53, certificate expiration", checks: 10, category: "DNS" },
  { number: 9, name: "API & Application Security", description: "API Gateway, AppSync, Cognito security", checks: 12, category: "Application" },
  { number: 10, name: "Messaging & Queue Security", description: "SQS, SNS, SES security configurations", checks: 10, category: "Messaging" },
  { number: 11, name: "Advanced Security Services", description: "Security Hub, Inspector, Macie, Access Analyzer", checks: 15, category: "Security" },
  { number: 12, name: "SSM & Patch Management", description: "Systems Manager, patch compliance, inventory", checks: 12, category: "Operations" },
  { number: 13, name: "Backup & Disaster Recovery", description: "AWS Backup, snapshots, retention policies", checks: 15, category: "DR" },
  { number: 14, name: "Advanced Network Security", description: "WAF, Shield, Network Firewall, Transit Gateway", checks: 18, category: "Network" },
  { number: 15, name: "Resource Optimization", description: "Cost optimization, unused resources, rightsizing", checks: 15, category: "Cost" },
  { number: 16, name: "Compliance & Governance", description: "Config rules, conformance packs, tagging", checks: 12, category: "Governance" },
  { number: 17, name: "Container & Serverless Deep Dive", description: "ECR, Lambda layers, container vulnerabilities", checks: 15, category: "Compute" },
  { number: 18, name: "Final Extended Report", description: "Summary and executive report generation", checks: 5, category: "Report" },
  { number: 19, name: "Secrets & Key Management", description: "Secrets Manager, KMS, key rotation", checks: 20, category: "Secrets" },
  { number: 20, name: "CI/CD Pipeline Security", description: "CodePipeline, CodeBuild, CodeDeploy security", checks: 15, category: "DevOps" },
  { number: 21, name: "Performance & Reliability", description: "CloudWatch alarms, Auto Scaling, health checks", checks: 15, category: "Reliability" },
  { number: 22, name: "Incident Response Readiness", description: "Forensic capabilities, isolation, log retention", checks: 15, category: "IR" },
  { number: 23, name: "Multi-Region & Disaster Recovery", description: "Cross-region replication, failover, global resources", checks: 15, category: "DR" },
  { number: 24, name: "Account & Billing Security", description: "Account contacts, billing alerts, cost anomalies", checks: 15, category: "Account" },
  { number: 25, name: "Subdomain Takeover & Dangling DNS", description: "Orphaned DNS records, dangling resources", checks: 15, category: "DNS" },
];

// Dashboard stats
export interface DashboardStats {
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  riskScore: number;
  lastScanAt: Date | null;
  accountsCount: number;
  auditsCount: number;
}

// Chart data types
export interface FindingsTrendData {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SeverityDistribution {
  name: string;
  value: number;
  color: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
