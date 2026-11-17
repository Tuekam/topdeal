import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "./generated/prisma/client";

export { Prisma, PrismaClient };

type DatabaseClientOptions = {
  maxConnections?: number;
  connectionTimeoutMillis?: number;
};

export function createDatabaseClient(
  connectionString: string,
  options: DatabaseClientOptions = {},
): PrismaClient {
  const adapter = new PrismaPg({
    connectionString,
    max: options.maxConnections ?? 10,
    connectionTimeoutMillis: options.connectionTimeoutMillis ?? 5_000,
  });

  return new PrismaClient({ adapter });
}
