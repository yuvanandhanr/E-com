import { NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (err) {
    console.error('Error generating metrics:', err);
    return NextResponse.json({ error: 'Metrics generation failed' }, { status: 500 });
  }
}

