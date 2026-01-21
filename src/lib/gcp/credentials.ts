import { Storage } from "@google-cloud/storage";
import { Compute } from "@google-cloud/compute";
import { v1 as ResourceManager } from "@google-cloud/resource-manager";
import { KeyManagementServiceClient } from "@google-cloud/kms";
import { Logging } from "@google-cloud/logging";
import { BigQuery } from "@google-cloud/bigquery";
import { PubSub } from "@google-cloud/pubsub";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

export interface GcpCredentials {
  projectId: string;
  credentials: {
    client_email: string;
    private_key: string;
    project_id: string;
    [key: string]: unknown;
  };
}

/**
 * Parse service account key JSON and create credentials object
 */
export function parseServiceAccountKey(keyJson: string): GcpCredentials {
  try {
    const key = JSON.parse(keyJson);

    if (!key.client_email || !key.private_key || !key.project_id) {
      throw new Error("Invalid service account key: missing required fields");
    }

    return {
      projectId: key.project_id,
      credentials: key,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format for service account key");
    }
    throw error;
  }
}

/**
 * Create authenticated GCP Storage client
 */
export function createStorageClient(credentials: GcpCredentials): Storage {
  return new Storage({
    projectId: credentials.projectId,
    credentials: credentials.credentials,
  });
}

/**
 * Create authenticated GCP Compute client
 */
export function createComputeClient(credentials: GcpCredentials): Compute {
  return new Compute({
    projectId: credentials.projectId,
    credentials: credentials.credentials,
  });
}

/**
 * Create authenticated GCP Resource Manager client
 */
export function createResourceManagerClient(
  credentials: GcpCredentials
): ResourceManager.ProjectsClient {
  return new ResourceManager.ProjectsClient({
    projectId: credentials.projectId,
    credentials: credentials.credentials,
  });
}

/**
 * Create authenticated GCP KMS client
 */
export function createKmsClient(
  credentials: GcpCredentials
): KeyManagementServiceClient {
  return new KeyManagementServiceClient({
    projectId: credentials.projectId,
    credentials: credentials.credentials,
  });
}

/**
 * Create authenticated GCP Logging client
 */
export function createLoggingClient(credentials: GcpCredentials): Logging {
  return new Logging({
    projectId: credentials.projectId,
    credentials: credentials.credentials,
  });
}

/**
 * Create authenticated GCP BigQuery client
 */
export function createBigQueryClient(credentials: GcpCredentials): BigQuery {
  return new BigQuery({
    projectId: credentials.projectId,
    credentials: credentials.credentials,
  });
}

/**
 * Create authenticated GCP PubSub client
 */
export function createPubSubClient(credentials: GcpCredentials): PubSub {
  return new PubSub({
    projectId: credentials.projectId,
    credentials: credentials.credentials,
  });
}

/**
 * Create authenticated GCP Secret Manager client
 */
export function createSecretManagerClient(
  credentials: GcpCredentials
): SecretManagerServiceClient {
  return new SecretManagerServiceClient({
    projectId: credentials.projectId,
    credentials: credentials.credentials,
  });
}

/**
 * Validate GCP credentials by making a test API call
 */
export async function validateCredentials(
  credentials: GcpCredentials
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Try to list buckets as a simple validation
    const storage = createStorageClient(credentials);
    await storage.getBuckets({ maxResults: 1 });
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { valid: false, error: message };
  }
}

/**
 * Get all GCP clients for a project
 */
export function getGcpClients(credentials: GcpCredentials) {
  return {
    storage: createStorageClient(credentials),
    compute: createComputeClient(credentials),
    resourceManager: createResourceManagerClient(credentials),
    kms: createKmsClient(credentials),
    logging: createLoggingClient(credentials),
    bigquery: createBigQueryClient(credentials),
    pubsub: createPubSubClient(credentials),
    secretManager: createSecretManagerClient(credentials),
  };
}
