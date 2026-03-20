import { NextResponse } from 'next/server';
import { buildExcelExport, buildPdfExport } from '@/lib/export';
import { getAuthSession } from '@/lib/auth';

function getFilename(extension: 'pdf' | 'xlsx') {
  const date = new Date().toISOString().slice(0, 10);
  return `accounts-export-${date}.${extension}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  try {
    const isAuthenticated = await getAuthSession();

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (format === 'excel') {
      const file = await buildExcelExport();

      return new NextResponse(file, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${getFilename('xlsx')}"`,
        },
      });
    }

    if (format === 'pdf') {
      const file = await buildPdfExport();

      return new NextResponse(file, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${getFilename('pdf')}"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid export format. Use "pdf" or "excel".' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to export accounts.' },
      { status: 500 }
    );
  }
}
