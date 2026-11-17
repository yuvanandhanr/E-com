import { NextResponse } from 'next/server';
import { httpRequestCounter, httpRequestDuration } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'crash';
  const delayMs = Number(searchParams.get('ms')) || 3000;

  const start = Date.now();

  // 1. Latency Spike Simulation
  if (type === 'latency') {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const duration = (Date.now() - start) / 1000;
    httpRequestCounter.inc({ method: 'GET', route: '/api/chaos', status: '200' });
    httpRequestDuration.observe({ method: 'GET', route: '/api/chaos', status: '200' }, duration);

    return NextResponse.json({
      scenario: 'SIMULATED_LATENCY_SPIKE',
      delayedMs: delayMs,
      message: `Artificial latency of ${delayMs}ms injected. Check p95/p99 latency chart in Grafana!`,
    });
  }

  // 2. Memory Spike Simulation
  if (type === 'leak') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const temporaryBuffers: any[] = [];
    for (let i = 0; i < 20; i++) {
      temporaryBuffers.push(Buffer.alloc(2 * 1024 * 1024)); // 40MB heap spike
    }
    const duration = (Date.now() - start) / 1000;
    httpRequestCounter.inc({ method: 'GET', route: '/api/chaos', status: '200' });
    httpRequestDuration.observe({ method: 'GET', route: '/api/chaos', status: '200' }, duration);

    return NextResponse.json({
      scenario: 'SIMULATED_MEMORY_SPIKE',
      allocatedMB: 40,
      message: 'Allocated 40MB heap memory spike. Check V8 Heap Memory chart in Grafana!',
    });
  }

  // 3. Default: 500 Internal Server Error Crash
  const duration = (Date.now() - start) / 1000;
  httpRequestCounter.inc({ method: 'GET', route: '/api/chaos', status: '500' });
  httpRequestDuration.observe({ method: 'GET', route: '/api/chaos', status: '500' }, duration);

  return NextResponse.json(
    {
      error: 'CRITICAL_ORDER_FULFILLMENT_CRASH',
      scenario: 'SIMULATED_500_SERVER_FAILURE',
      message: 'Simulated 500 error triggered. Check HTTP 5xx Failures chart in Grafana!',
    },
    { status: 500 }
  );
}

