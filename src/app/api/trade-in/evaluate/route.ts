import { NextResponse } from 'next/server';
import { calculateTradeInValue, ConditionForm, SUPPORTED_DEVICES } from '@/lib/valuation-engine';

export async function GET() {
  return NextResponse.json({ devices: SUPPORTED_DEVICES });
}

export async function POST(request: Request) {
  try {
    const body: ConditionForm = await request.json();
    const result = calculateTradeInValue(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Valuation error:', error);
    return NextResponse.json({ error: 'Failed to evaluate trade-in value' }, { status: 500 });
  }
}

