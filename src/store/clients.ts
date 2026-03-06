// In-memory client version registry

import { ClientVersion, ApiVersion } from '../types/shared';
import { randomUUID } from 'crypto';

// In-memory storage
const clients = new Map<string, ClientVersion>();

// CRUD operations
export const registerClient = (clientId: string, version: ApiVersion): ClientVersion => {
  const apiKey = randomUUID();
  const client: ClientVersion = {
    clientId,
    version,
    apiKey,
    registeredAt: new Date(),
  };
  
  clients.set(clientId, client);
  return client;
};

export const getClientById = (clientId: string): ClientVersion | undefined => {
  return clients.get(clientId);
};

export const getAllClients = (): ClientVersion[] => {
  return Array.from(clients.values());
};

export const updateClientVersion = (clientId: string, version: ApiVersion): ClientVersion | undefined => {
  const existing = clients.get(clientId);
  if (!existing) {
    return undefined;
  }
  
  existing.version = version;
  clients.set(clientId, existing);
  return existing;
};

// Seed some test clients
export const seedClients = (): void => {
  registerClient('client-v1-demo', 'v1');
  registerClient('client-v2-demo', 'v2');
  registerClient('client-v3-demo', 'v3');
};
