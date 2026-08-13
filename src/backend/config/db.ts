import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
if (dbUrl.startsWith('file:') && !dbUrl.includes('/')) {
  const relativePath = dbUrl.replace('file:', '');
  dbUrl = `file:${path.resolve(relativePath)}`;
}

const adapter = new PrismaLibSql({ url: dbUrl });

export const prisma = new PrismaClient({ adapter });

export default prisma;
