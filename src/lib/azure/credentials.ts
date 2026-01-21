import { ClientSecretCredential, TokenCredential } from "@azure/identity";
import { ComputeManagementClient } from "@azure/arm-compute";
import { StorageManagementClient } from "@azure/arm-storage";
import { NetworkManagementClient } from "@azure/arm-network";
import { KeyVaultManagementClient } from "@azure/arm-keyvault";
import { MonitorClient } from "@azure/arm-monitor";
import { AuthorizationManagementClient } from "@azure/arm-authorization";
import { SqlManagementClient } from "@azure/arm-sql";
import { ContainerServiceClient } from "@azure/arm-containerservice";
import { WebSiteManagementClient } from "@azure/arm-appservice";
import { CosmosDBManagementClient } from "@azure/arm-cosmosdb";

export interface AzureCredentials {
  subscriptionId: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

/**
 * Create Azure credential object from service principal
 */
export function createCredential(credentials: AzureCredentials): TokenCredential {
  return new ClientSecretCredential(
    credentials.tenantId,
    credentials.clientId,
    credentials.clientSecret
  );
}

/**
 * Validate Azure credentials by making a test API call
 */
export async function validateCredentials(
  credentials: AzureCredentials
): Promise<{ valid: boolean; error?: string }> {
  try {
    const credential = createCredential(credentials);
    const computeClient = new ComputeManagementClient(
      credential,
      credentials.subscriptionId
    );

    // Try to list VMs as a simple validation
    const vms = computeClient.virtualMachines.listAll();
    // Just iterate once to verify credentials work
    for await (const _ of vms) {
      break;
    }

    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { valid: false, error: message };
  }
}

/**
 * Create authenticated Azure Compute Management client
 */
export function createComputeClient(
  credentials: AzureCredentials
): ComputeManagementClient {
  const credential = createCredential(credentials);
  return new ComputeManagementClient(credential, credentials.subscriptionId);
}

/**
 * Create authenticated Azure Storage Management client
 */
export function createStorageClient(
  credentials: AzureCredentials
): StorageManagementClient {
  const credential = createCredential(credentials);
  return new StorageManagementClient(credential, credentials.subscriptionId);
}

/**
 * Create authenticated Azure Network Management client
 */
export function createNetworkClient(
  credentials: AzureCredentials
): NetworkManagementClient {
  const credential = createCredential(credentials);
  return new NetworkManagementClient(credential, credentials.subscriptionId);
}

/**
 * Create authenticated Azure Key Vault Management client
 */
export function createKeyVaultClient(
  credentials: AzureCredentials
): KeyVaultManagementClient {
  const credential = createCredential(credentials);
  return new KeyVaultManagementClient(credential, credentials.subscriptionId);
}

/**
 * Create authenticated Azure Monitor client
 */
export function createMonitorClient(
  credentials: AzureCredentials
): MonitorClient {
  const credential = createCredential(credentials);
  return new MonitorClient(credential, credentials.subscriptionId);
}

/**
 * Create authenticated Azure Authorization Management client
 */
export function createAuthorizationClient(
  credentials: AzureCredentials
): AuthorizationManagementClient {
  const credential = createCredential(credentials);
  return new AuthorizationManagementClient(credential, credentials.subscriptionId);
}

/**
 * Create authenticated Azure SQL Management client
 */
export function createSqlClient(
  credentials: AzureCredentials
): SqlManagementClient {
  const credential = createCredential(credentials);
  return new SqlManagementClient(credential, credentials.subscriptionId);
}

/**
 * Create authenticated Azure Container Service (AKS) client
 */
export function createContainerServiceClient(
  credentials: AzureCredentials
): ContainerServiceClient {
  const credential = createCredential(credentials);
  return new ContainerServiceClient(credential, credentials.subscriptionId);
}

/**
 * Create authenticated Azure App Service client
 */
export function createAppServiceClient(
  credentials: AzureCredentials
): WebSiteManagementClient {
  const credential = createCredential(credentials);
  return new WebSiteManagementClient(credential, credentials.subscriptionId);
}

/**
 * Create authenticated Azure Cosmos DB client
 */
export function createCosmosDbClient(
  credentials: AzureCredentials
): CosmosDBManagementClient {
  const credential = createCredential(credentials);
  return new CosmosDBManagementClient(credential, credentials.subscriptionId);
}

/**
 * Get all Azure clients for a subscription
 */
export function getAzureClients(credentials: AzureCredentials) {
  return {
    compute: createComputeClient(credentials),
    storage: createStorageClient(credentials),
    network: createNetworkClient(credentials),
    keyVault: createKeyVaultClient(credentials),
    monitor: createMonitorClient(credentials),
    authorization: createAuthorizationClient(credentials),
    sql: createSqlClient(credentials),
    containerService: createContainerServiceClient(credentials),
    appService: createAppServiceClient(credentials),
    cosmosDb: createCosmosDbClient(credentials),
  };
}
