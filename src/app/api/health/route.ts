import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  let dbStatus = 'DOWN';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'UP';
  } catch (err) {
    dbStatus = 'DOWN';
  }

  const memory = process.memoryUsage();
  const isHealthy = dbStatus === 'UP';

  return NextResponse.json(
    {
      status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      database: dbStatus,
      heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      responseTimeMs: Date.now() - start,
    },
    { status: isHealthy ? 200 : 503 }
  );
}

