import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "./generated/prisma/client";

export { Prisma, PrismaClient };

export function createDatabaseClient(connectionString: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}
