import { NextResponse } from 'next/server';
import { importAccounts } from '@/lib/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accounts = body.accounts;

    if (!Array.isArray(accounts)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    const result = await importAccounts(accounts);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
