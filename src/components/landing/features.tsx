"use client";

import {
  Shield,
  Cloud,
  Lock,
  BarChart3,
  FileText,
  Bot,
  Network,
  Key,
  Server,
  Database,
  AlertTriangle,
  CheckCircle2,
  Users,
  Globe,
  HardDrive,
  Container,
  Layers,
} from "lucide-react";

// Cloud Provider Icons
function AwsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.264-.168.312a.549.549 0 0 1-.32.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.415-.287-.806-.407l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167z"/>
    </svg>
  );
}

function GcpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-8.825-6.893zM8.073 19.831a4.966 4.966 0 0 1-2.9-1.088l.006-.003a5.002 5.002 0 0 1 .004-7.47l.003.003.003-.003.006.007a5.006 5.006 0 0 1 7.471.003l-1.768 1.768a2.501 2.501 0 1 0 0 3.536l1.77 1.77a5.013 5.013 0 0 1-4.595 1.477zm11.034-5.012l-2.004-.001v2.004h-1.5v-2.004l-2.004-.001v-1.501h2.004V11.31h1.5v2.006l2.004-.001z"/>
    </svg>
  );
}

function AzureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.483 21.3H24L14.025 4.013l-3.038 8.347 5.836 6.938L5.483 21.3zM13.23 2.7L6.105 8.677 0 19.253h5.505l7.725-16.553z"/>
    </svg>
  );
}

const features = [
  {
    icon: Globe,
    title: "Multi-Cloud Support",
    description:
      "Unified security auditing for AWS, GCP, and Azure. One dashboard to rule all your cloud environments.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    icon: BarChart3,
    title: "Risk Scoring",
    description:
      "Get a clear security score for each cloud account with severity-based findings classification.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Claude-powered chatbot to help you understand findings and get remediation recommendations.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
  },
  {
    icon: Layers,
    title: "Multi-Account",
    description:
      "Connect and audit multiple accounts, projects, and subscriptions from a single dashboard.",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    icon: FileText,
    title: "Reports",
    description:
      "Generate professional PDF, Word, and Markdown reports for compliance and stakeholders.",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  {
    icon: Lock,
    title: "Secrets Detection",
    description:
      "Identify exposed credentials, unrotated keys, and secrets across all your cloud resources.",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
  },
];

const cloudProviders = [
  {
    name: "AWS",
    icon: AwsIcon,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    services: [
      { icon: Users, name: "IAM Security" },
      { icon: Database, name: "S3 Buckets" },
      { icon: Server, name: "EC2 Instances" },
      { icon: Network, name: "VPC & Security Groups" },
      { icon: Key, name: "KMS & Secrets" },
      { icon: HardDrive, name: "RDS & DynamoDB" },
      { icon: Container, name: "Lambda & ECS" },
      { icon: BarChart3, name: "CloudTrail & CloudWatch" },
    ],
    description: "25 phases covering 340+ security checks across all major AWS services.",
  },
  {
    name: "GCP",
    icon: GcpIcon,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    services: [
      { icon: Users, name: "IAM & Policies" },
      { icon: Database, name: "Cloud Storage" },
      { icon: Server, name: "Compute Engine" },
      { icon: Network, name: "VPC & Firewall" },
      { icon: Key, name: "KMS & Secret Manager" },
      { icon: HardDrive, name: "Cloud SQL & BigQuery" },
      { icon: Container, name: "Cloud Functions & GKE" },
      { icon: BarChart3, name: "Logging & Monitoring" },
    ],
    description: "Comprehensive GCP security auditing for projects and organizations.",
  },
  {
    name: "Azure",
    icon: AzureIcon,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    services: [
      { icon: Users, name: "Azure AD & RBAC" },
      { icon: Database, name: "Blob Storage" },
      { icon: Server, name: "Virtual Machines" },
      { icon: Network, name: "VNet & NSG" },
      { icon: Key, name: "Key Vault" },
      { icon: HardDrive, name: "SQL & Cosmos DB" },
      { icon: Container, name: "Functions & AKS" },
      { icon: BarChart3, name: "Monitor & Sentinel" },
    ],
    description: "Full Azure subscription security auditing with Defender integration.",
  },
];

const phases = [
  { icon: Lock, name: "IAM Security" },
  { icon: Database, name: "Storage Security" },
  { icon: Network, name: "Network Security" },
  { icon: BarChart3, name: "Logging & Monitoring" },
  { icon: Server, name: "Compute Security" },
  { icon: Database, name: "Data Services" },
  { icon: Key, name: "Secrets Management" },
  { icon: AlertTriangle, name: "Incident Response" },
];

// Detailed phases for each cloud provider
const awsPhases = [
  { phase: 1, name: "IAM Users & Policies", checks: 18, description: "MFA, password policies, unused credentials, admin privileges" },
  { phase: 2, name: "IAM Roles & Trust", checks: 12, description: "Cross-account access, role permissions, trust policies" },
  { phase: 3, name: "S3 Bucket Security", checks: 22, description: "Public access, encryption, versioning, lifecycle policies" },
  { phase: 4, name: "EC2 Security", checks: 16, description: "Security groups, IMDSv2, EBS encryption, public IPs" },
  { phase: 5, name: "VPC & Networking", checks: 20, description: "NACLs, flow logs, peering, endpoints, NAT gateways" },
  { phase: 6, name: "RDS & Databases", checks: 14, description: "Encryption, public access, backups, Multi-AZ" },
  { phase: 7, name: "Lambda Security", checks: 10, description: "Function permissions, VPC config, environment variables" },
  { phase: 8, name: "ECS & EKS", checks: 12, description: "Container security, task roles, cluster config" },
  { phase: 9, name: "CloudTrail & Logging", checks: 15, description: "Trail config, S3 logging, CloudWatch integration" },
  { phase: 10, name: "KMS & Encryption", checks: 11, description: "Key rotation, key policies, CMK usage" },
  { phase: 11, name: "Secrets Manager", checks: 8, description: "Secret rotation, access policies, unused secrets" },
  { phase: 12, name: "CloudWatch", checks: 14, description: "Alarms, metrics, log groups, retention" },
  { phase: 13, name: "SNS & SQS", checks: 9, description: "Topic policies, encryption, dead letter queues" },
  { phase: 14, name: "API Gateway", checks: 10, description: "Authentication, throttling, WAF integration" },
  { phase: 15, name: "ElastiCache & DynamoDB", checks: 11, description: "Encryption, VPC, backup configuration" },
  { phase: 16, name: "ELB & CloudFront", checks: 13, description: "SSL/TLS, security policies, WAF, access logs" },
  { phase: 17, name: "Route 53 & DNS", checks: 7, description: "DNSSEC, query logging, health checks" },
  { phase: 18, name: "WAF & Shield", checks: 9, description: "Web ACLs, rate limiting, DDoS protection" },
  { phase: 19, name: "Config & Compliance", checks: 12, description: "Config rules, conformance packs, remediation" },
  { phase: 20, name: "GuardDuty & Security Hub", checks: 10, description: "Threat detection, findings aggregation" },
  { phase: 21, name: "Backup & DR", checks: 11, description: "Backup plans, cross-region, retention policies" },
  { phase: 22, name: "Cost & Resource Optimization", checks: 8, description: "Unused resources, rightsizing recommendations" },
  { phase: 23, name: "Organizations & SCPs", checks: 9, description: "Service control policies, account structure" },
  { phase: 24, name: "SSO & Identity Center", checks: 7, description: "Permission sets, MFA, session duration" },
  { phase: 25, name: "Inspector & Vulnerability", checks: 10, description: "CVE scanning, ECR scanning, findings" },
];

const gcpPhases = [
  { phase: 1, name: "IAM & Service Accounts", checks: 16, description: "Primitive roles, service account keys, impersonation" },
  { phase: 2, name: "Organization Policies", checks: 12, description: "Constraints, inheritance, folder structure" },
  { phase: 3, name: "Cloud Storage", checks: 18, description: "Public access, uniform bucket access, lifecycle" },
  { phase: 4, name: "Compute Engine", checks: 15, description: "OS login, serial ports, default service accounts" },
  { phase: 5, name: "VPC & Firewall", checks: 17, description: "Firewall rules, VPC flow logs, private Google access" },
  { phase: 6, name: "Cloud SQL", checks: 13, description: "SSL enforcement, public IPs, backup config" },
  { phase: 7, name: "BigQuery", checks: 11, description: "Dataset access, encryption, audit logging" },
  { phase: 8, name: "GKE Security", checks: 14, description: "Private clusters, workload identity, node security" },
  { phase: 9, name: "Cloud Functions", checks: 9, description: "Ingress settings, VPC connector, permissions" },
  { phase: 10, name: "Cloud Run", checks: 10, description: "Ingress, authentication, service accounts" },
  { phase: 11, name: "Cloud KMS", checks: 10, description: "Key rotation, IAM bindings, HSM protection" },
  { phase: 12, name: "Secret Manager", checks: 8, description: "Access control, rotation, versions" },
  { phase: 13, name: "Cloud Logging", checks: 12, description: "Audit logs, log sinks, retention" },
  { phase: 14, name: "Cloud Monitoring", checks: 11, description: "Alerting policies, uptime checks, dashboards" },
  { phase: 15, name: "Pub/Sub", checks: 8, description: "Topic IAM, encryption, dead lettering" },
  { phase: 16, name: "Cloud Armor", checks: 9, description: "Security policies, WAF rules, DDoS protection" },
  { phase: 17, name: "Load Balancing", checks: 10, description: "SSL policies, health checks, CDN config" },
  { phase: 18, name: "Cloud DNS", checks: 6, description: "DNSSEC, private zones, response policies" },
  { phase: 19, name: "Security Command Center", checks: 10, description: "Findings, assets, vulnerability scanning" },
  { phase: 20, name: "Binary Authorization", checks: 7, description: "Attestors, policies, admission control" },
  { phase: 21, name: "VPC Service Controls", checks: 8, description: "Perimeters, access levels, bridges" },
  { phase: 22, name: "Cloud Asset Inventory", checks: 6, description: "Asset monitoring, policy analysis" },
  { phase: 23, name: "Dataflow & Dataproc", checks: 9, description: "Encryption, VPC, service accounts" },
  { phase: 24, name: "Backup & DR", checks: 8, description: "Backup plans, snapshots, cross-region" },
  { phase: 25, name: "Resource Manager", checks: 7, description: "Labels, quotas, recommendations" },
];

const azurePhases = [
  { phase: 1, name: "Azure AD & Identity", checks: 18, description: "MFA, conditional access, PIM, guest access" },
  { phase: 2, name: "RBAC & Permissions", checks: 14, description: "Custom roles, role assignments, scope" },
  { phase: 3, name: "Blob Storage", checks: 16, description: "Public access, soft delete, immutability" },
  { phase: 4, name: "Virtual Machines", checks: 15, description: "Disk encryption, extensions, managed identity" },
  { phase: 5, name: "Virtual Networks", checks: 17, description: "NSGs, ASGs, service endpoints, peering" },
  { phase: 6, name: "Azure SQL", checks: 14, description: "TDE, auditing, threat detection, firewall" },
  { phase: 7, name: "Cosmos DB", checks: 11, description: "Network rules, encryption, RBAC" },
  { phase: 8, name: "AKS Security", checks: 13, description: "Network policies, Azure AD integration, pod security" },
  { phase: 9, name: "Azure Functions", checks: 10, description: "Authentication, VNet integration, managed identity" },
  { phase: 10, name: "App Service", checks: 12, description: "HTTPS only, TLS version, authentication" },
  { phase: 11, name: "Key Vault", checks: 12, description: "Access policies, soft delete, purge protection" },
  { phase: 12, name: "Activity Log", checks: 10, description: "Diagnostic settings, retention, alerts" },
  { phase: 13, name: "Azure Monitor", checks: 11, description: "Action groups, alert rules, workbooks" },
  { phase: 14, name: "Log Analytics", checks: 9, description: "Workspace config, data retention, queries" },
  { phase: 15, name: "Service Bus & Event Hub", checks: 9, description: "Network rules, encryption, access policies" },
  { phase: 16, name: "Application Gateway", checks: 10, description: "WAF policies, SSL, health probes" },
  { phase: 17, name: "Azure Front Door", checks: 9, description: "WAF, caching, routing rules" },
  { phase: 18, name: "Azure DNS", checks: 6, description: "DNSSEC, private zones, virtual network links" },
  { phase: 19, name: "Microsoft Defender", checks: 14, description: "Defender for Cloud, security score, recommendations" },
  { phase: 20, name: "Azure Sentinel", checks: 10, description: "Analytics rules, playbooks, threat hunting" },
  { phase: 21, name: "Azure Policy", checks: 11, description: "Policy assignments, initiatives, compliance" },
  { phase: 22, name: "Blueprints & Landing Zones", checks: 8, description: "Blueprint assignments, management groups" },
  { phase: 23, name: "Azure Backup", checks: 9, description: "Recovery vaults, backup policies, soft delete" },
  { phase: 24, name: "Site Recovery", checks: 7, description: "Replication, failover, recovery plans" },
  { phase: 25, name: "Cost Management", checks: 6, description: "Budgets, anomaly detection, recommendations" },
];

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="w-full px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-white">Built for Security Teams</span>
            <br />
            <span className="text-gradient-purple">Who Don't Cut Corners</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/50">
            From IAM misconfigurations to exposed storage buckets, we find what others miss.
            Comprehensive. Automated. Multi-cloud.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-8 group"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-white/50 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Cloud Provider Sections */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Security Coverage by Cloud Platform
            </h3>
            <p className="text-white/50 max-w-2xl mx-auto">
              Comprehensive security auditing tailored for each cloud provider's unique services
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {cloudProviders.map((provider, index) => {
              const ProviderIcon = provider.icon;
              return (
                <div
                  key={index}
                  className={`glass-card p-8 border ${provider.borderColor} hover:border-opacity-50 transition-all`}
                >
                  {/* Provider Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-xl ${provider.bgColor}`}>
                      <ProviderIcon className={`w-8 h-8 ${provider.color}`} />
                    </div>
                    <div>
                      <h4 className={`text-2xl font-bold ${provider.color}`}>
                        {provider.name}
                      </h4>
                      <p className="text-sm text-white/40">Security Audit</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/50 text-sm mb-6">
                    {provider.description}
                  </p>

                  {/* Services Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {provider.services.map((service, sIndex) => (
                      <div
                        key={sIndex}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <service.icon className={`w-4 h-4 ${provider.color}`} />
                        <span className="text-xs text-white/70">{service.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Phases by Cloud Provider */}
        <div id="phases" className="mt-32">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
              25 Audit Phases Per Cloud Platform
            </h3>
            <p className="text-white/50 max-w-2xl mx-auto">
              Comprehensive security coverage with 500+ automated checks across all cloud providers
            </p>
          </div>

          {/* AWS Phases */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <AwsIcon className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-orange-400">AWS Security Phases</h4>
                <p className="text-white/50 text-sm">25 phases &bull; 280+ security checks</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {awsPhases.map((phase) => (
                <div
                  key={phase.phase}
                  className="p-4 rounded-xl bg-white/5 border border-orange-500/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-orange-400/60">Phase {phase.phase}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">{phase.checks} checks</span>
                  </div>
                  <h5 className="text-sm font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">
                    {phase.name}
                  </h5>
                  <p className="text-xs text-white/40 line-clamp-2">{phase.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* GCP Phases */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <GcpIcon className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-blue-400">GCP Security Phases</h4>
                <p className="text-white/50 text-sm">25 phases &bull; 248+ security checks</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {gcpPhases.map((phase) => (
                <div
                  key={phase.phase}
                  className="p-4 rounded-xl bg-white/5 border border-blue-500/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400/60">Phase {phase.phase}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{phase.checks} checks</span>
                  </div>
                  <h5 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {phase.name}
                  </h5>
                  <p className="text-xs text-white/40 line-clamp-2">{phase.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Azure Phases */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-cyan-500/10">
                <AzureIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-cyan-400">Azure Security Phases</h4>
                <p className="text-white/50 text-sm">25 phases &bull; 264+ security checks</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {azurePhases.map((phase) => (
                <div
                  key={phase.phase}
                  className="p-4 rounded-xl bg-white/5 border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-400/60">Phase {phase.phase}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">{phase.checks} checks</span>
                  </div>
                  <h5 className="text-sm font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                    {phase.name}
                  </h5>
                  <p className="text-xs text-white/40 line-clamp-2">{phase.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-white/10">
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-purple mb-2">75</div>
              <div className="text-white/60 text-sm">Total Phases</div>
              <div className="text-white/40 text-xs">25 per platform</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-purple mb-2">792+</div>
              <div className="text-white/60 text-sm">Security Checks</div>
              <div className="text-white/40 text-xs">Automated scanning</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-purple mb-2">100%</div>
              <div className="text-white/60 text-sm">CIS Coverage</div>
              <div className="text-white/40 text-xs">Benchmark compliance</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-purple mb-2">24/7</div>
              <div className="text-white/60 text-sm">Continuous Monitoring</div>
              <div className="text-white/40 text-xs">Real-time alerts</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              How It Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Cloud Accounts",
                description: "Add your AWS accounts, GCP projects, or Azure subscriptions with read-only permissions.",
              },
              {
                step: "02",
                title: "Run Security Audit",
                description: "Launch comprehensive audits that scan 500+ security controls across all platforms.",
              },
              {
                step: "03",
                title: "Review & Remediate",
                description: "Get detailed findings with severity ratings and AI-powered remediation guidance.",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6">
                    <span className="text-3xl font-bold text-gradient-purple">{item.step}</span>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">{item.title}</h4>
                  <p className="text-white/50">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Checks Section */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              What We Check
            </h3>
            <p className="text-white/50 max-w-2xl mx-auto">
              Comprehensive security coverage across identity, network, data, and compute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Identity & Access",
                items: ["MFA enforcement", "Password policies", "Unused credentials", "Overprivileged roles", "Service account keys"],
                color: "text-purple-400",
                bgColor: "bg-purple-500/10",
              },
              {
                title: "Network Security",
                items: ["Open security groups", "Public endpoints", "VPN configurations", "Firewall rules", "Load balancer SSL"],
                color: "text-blue-400",
                bgColor: "bg-blue-500/10",
              },
              {
                title: "Data Protection",
                items: ["Encryption at rest", "Public buckets/blobs", "Backup configurations", "Data retention", "Cross-region replication"],
                color: "text-green-400",
                bgColor: "bg-green-500/10",
              },
              {
                title: "Compliance",
                items: ["CIS benchmarks", "SOC 2 controls", "HIPAA requirements", "PCI DSS checks", "GDPR compliance"],
                color: "text-orange-400",
                bgColor: "bg-orange-500/10",
              },
            ].map((category, index) => (
              <div key={index} className="glass-card p-6">
                <h4 className={`text-lg font-semibold ${category.color} mb-4`}>
                  {category.title}
                </h4>
                <ul className="space-y-2">
                  {category.items.map((item, iIndex) => (
                    <li key={iIndex} className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle2 className={`w-4 h-4 ${category.color}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
