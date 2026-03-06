// Shared types across all versions

export type ApiVersion = 'v1' | 'v2' | 'v3';

export interface ClientVersion {
  clientId: string;
  version: ApiVersion;
  apiKey: string;
  registeredAt: Date;
}

// Context variables for Hono middleware
export type Env = {
  Variables: {
    apiVersion: ApiVersion;
    clientId: string;
  };
};
