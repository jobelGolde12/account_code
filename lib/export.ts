import * as XLSX from 'xlsx';
import { asc, isNull } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

type ExportRow = {
  ID: number;
  JEV: string;
  BARANGAY: string;
  DATE: string;
  CHECK_RCD_NO: string;
  PAYEE: string;
  PARTICULARS: string;
  CODE: string;
  ACCOUNT: string;
  DEBIT: string;
  CREDIT: string;
  CREATED_AT: string;
  UPDATED_AT: string;
};

type PdfTableRow = {
  id: string;
  code: string;
  date: string;
  barangay: string;
  account: string;
  payee: string;
  debit: string;
  credit: string;
};

type PdfColumn = {
  key: keyof PdfTableRow;
  label: string;
  width: number;
  align?: 'left' | 'right' | 'center';
};

const EXCEL_HEADERS = [
  'ID',
  'JEV',
  'BARANGAY',
  'DATE',
  'CHECK_RCD_NO',
  'PAYEE',
  'PARTICULARS',
  'CODE',
  'ACCOUNT',
  'DEBIT',
  'CREDIT',
  'CREATED_AT',
  'UPDATED_AT',
] as const;

const PDF_COLUMNS: PdfColumn[] = [
  { key: 'id', label: 'ID', width: 34, align: 'center' },
  { key: 'code', label: 'CODE', width: 72 },
  { key: 'date', label: 'DATE', width: 62 },
  { key: 'barangay', label: 'BARANGAY', width: 92 },
  { key: 'account', label: 'ACCOUNT', width: 170 },
  { key: 'payee', label: 'PAYEE', width: 150 },
  { key: 'debit', label: 'DEBIT', width: 90, align: 'right' },
  { key: 'credit', label: 'CREDIT', width: 90, align: 'right' },
];

function normalizeText(value: string | null): string {
  return (value ?? '')
    .replace(/[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F]/g, "'")
    .replace(/[\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?');
}

function pdfText(
  x: number,
  y: number,
  text: string,
  font: 'F1' | 'F2',
  size: number,
  color: [number, number, number]
) {
  return [
    'BT',
    `/${font} ${size} Tf`,
    `${color[0]} ${color[1]} ${color[2]} rg`,
    `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`,
    `(${escapePdfText(text)}) Tj`,
    'ET',
  ].join('\n');
}

function pdfRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: [number, number, number],
  stroke?: [number, number, number]
) {
  const commands = [
    `${fill[0]} ${fill[1]} ${fill[2]} rg`,
    stroke ? `${stroke[0]} ${stroke[1]} ${stroke[2]} RG` : '',
    `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`,
    stroke ? 'B' : 'f',
  ];

  return commands.filter(Boolean).join('\n');
}

function pdfLine(x1: number, y1: number, x2: number, y2: number, color: [number, number, number]) {
  return [
    `${color[0]} ${color[1]} ${color[2]} RG`,
    '0.6 w',
    `${x1.toFixed(2)} ${y1.toFixed(2)} m`,
    `${x2.toFixed(2)} ${y2.toFixed(2)} l`,
    'S',
  ].join('\n');
}

function chunkRows<T>(rows: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }

  return chunks;
}

function buildPdfDocument(pageStreams: string[], pageWidth: number, pageHeight: number): Buffer {
  const objects: string[] = [];
  const pageIds: number[] = [];

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesObjectIndex = objects.push('') - 1;
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  for (const stream of pageStreams) {
    const contentId = objects.length + 1;
    objects.push(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);

    const pageId = objects.length + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objects[pagesObjectIndex] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i < offsets.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}

function formatPdfRows(rows: ExportRow[]): PdfTableRow[] {
  return rows.map((row) => ({
    id: String(row.ID),
    code: truncate(row.CODE || '-', 12),
    date: truncate(row.DATE || '-', 10),
    barangay: truncate(row.BARANGAY || '-', 14),
    account: truncate(row.ACCOUNT || '-', 32),
    payee: truncate(row.PAYEE || '-', 28),
    debit: truncate(row.DEBIT || '-', 12),
    credit: truncate(row.CREDIT || '-', 12),
  }));
}

function buildStyledPdf(rows: ExportRow[]): Buffer {
  const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const pdfRows = formatPdfRows(rows);
  const pageWidth = 842;
  const pageHeight = 595;
  const marginX = 34;
  const topY = 548;
  const headerBottomY = 462;
  const tableTopY = 442;
  const footerY = 20;
  const rowHeight = 18;
  const headerRowHeight = 22;
  const rowsPerPage = 20;
  const tableWidth = PDF_COLUMNS.reduce((sum, column) => sum + column.width, 0);
  const pageChunks = chunkRows(pdfRows, rowsPerPage);
  const totalPages = Math.max(pageChunks.length, 1);
  const renderChunks = totalPages === 1 && pageChunks.length === 0 ? [[]] : pageChunks;

  const pageStreams = renderChunks.map((chunk, pageIndex) => {
    const commands: string[] = [];

    commands.push(pdfRect(0, 0, pageWidth, pageHeight, [0.98, 0.99, 1]));
    commands.push(pdfRect(marginX, headerBottomY, tableWidth, 86, [0.08, 0.25, 0.49]));
    commands.push(pdfRect(marginX + 430, headerBottomY + 12, 118, 58, [0.13, 0.35, 0.64]));
    commands.push(pdfRect(marginX + 562, headerBottomY + 12, 164, 58, [0.95, 0.97, 1], [0.82, 0.88, 0.96]));

    commands.push(pdfText(marginX + 22, topY - 12, 'ACCOUNT CODE SYSTEM', 'F2', 10, [0.78, 0.87, 1]));
    commands.push(pdfText(marginX + 22, topY - 38, 'Exported Account Records', 'F2', 22, [1, 1, 1]));
    commands.push(
      pdfText(
        marginX + 22,
        topY - 58,
        'Formatted export for review, record-keeping, and admin reporting.',
        'F1',
        10,
        [0.86, 0.92, 1]
      )
    );

    commands.push(pdfText(marginX + 452, topY - 24, 'TOTAL RECORDS', 'F2', 9, [0.78, 0.87, 1]));
    commands.push(pdfText(marginX + 452, topY - 48, String(rows.length), 'F2', 22, [1, 1, 1]));

    commands.push(pdfText(marginX + 580, topY - 24, 'GENERATED', 'F2', 9, [0.31, 0.39, 0.47]));
    commands.push(pdfText(marginX + 580, topY - 44, generatedAt, 'F2', 12, [0.1, 0.15, 0.2]));
    commands.push(
      pdfText(
        marginX + 580,
        topY - 62,
        `Page ${pageIndex + 1} of ${totalPages}`,
        'F1',
        9,
        [0.36, 0.44, 0.53]
      )
    );

    commands.push(pdfRect(marginX, tableTopY - headerRowHeight, tableWidth, headerRowHeight, [0.89, 0.93, 0.98]));

    let currentX = marginX;
    for (const column of PDF_COLUMNS) {
      commands.push(pdfLine(currentX, tableTopY - headerRowHeight, currentX, tableTopY - headerRowHeight - (chunk.length * rowHeight), [0.88, 0.91, 0.95]));
      commands.push(pdfText(currentX + 6, tableTopY - 15, column.label, 'F2', 9, [0.17, 0.24, 0.33]));
      currentX += column.width;
    }
    commands.push(pdfLine(marginX + tableWidth, tableTopY - headerRowHeight, marginX + tableWidth, tableTopY - headerRowHeight - (chunk.length * rowHeight), [0.88, 0.91, 0.95]));
    commands.push(pdfLine(marginX, tableTopY - headerRowHeight, marginX + tableWidth, tableTopY - headerRowHeight, [0.8, 0.85, 0.91]));

    chunk.forEach((row, rowIndex) => {
      const rowTop = tableTopY - headerRowHeight - rowIndex * rowHeight;
      const rowBottom = rowTop - rowHeight;

      if (rowIndex % 2 === 0) {
        commands.push(pdfRect(marginX, rowBottom, tableWidth, rowHeight, [0.98, 0.99, 1]));
      }

      commands.push(pdfLine(marginX, rowBottom, marginX + tableWidth, rowBottom, [0.9, 0.93, 0.96]));

      let x = marginX;
      PDF_COLUMNS.forEach((column) => {
        const rawValue = row[column.key] || '-';
        const text = truncate(rawValue, Math.max(4, Math.floor(column.width / 6.7)));
        const textWidth = text.length * 4.7;
        const padding = 6;
        const y = rowBottom + 5.5;
        const color: [number, number, number] =
          column.key === 'debit' || column.key === 'credit' ? [0.09, 0.38, 0.26] : [0.18, 0.22, 0.28];

        let textX = x + padding;
        if (column.align === 'right') {
          textX = x + column.width - textWidth - padding;
        } else if (column.align === 'center') {
          textX = x + Math.max(padding, (column.width - textWidth) / 2);
        }

        commands.push(pdfText(textX, y, text, 'F1', 8.7, color));
        x += column.width;
      });
    });

    const tableBottomY = tableTopY - headerRowHeight - chunk.length * rowHeight;
    commands.push(pdfLine(marginX, tableBottomY, marginX + tableWidth, tableBottomY, [0.8, 0.85, 0.91]));
    commands.push(
      pdfText(
        marginX,
        footerY,
        'Generated from active account records in Turso. Deleted rows are excluded from this report.',
        'F1',
        8.5,
        [0.45, 0.5, 0.57]
      )
    );

    return commands.join('\n');
  });

  return buildPdfDocument(pageStreams, pageWidth, pageHeight);
}

export async function getExportRows(): Promise<ExportRow[]> {
  const accounts = await db
    .select()
    .from(schema.accounts)
    .where(isNull(schema.accounts.deletedAt))
    .orderBy(asc(schema.accounts.id));

  return accounts.map((account) => ({
    ID: account.id,
    JEV: normalizeText(account.jev),
    BARANGAY: normalizeText(account.barangay),
    DATE: normalizeText(account.date),
    CHECK_RCD_NO: normalizeText(account.checkRcdNo),
    PAYEE: normalizeText(account.payee),
    PARTICULARS: normalizeText(account.particulars),
    CODE: normalizeText(account.code),
    ACCOUNT: normalizeText(account.accounts),
    DEBIT: normalizeText(account.debit),
    CREDIT: normalizeText(account.credit),
    CREATED_AT: normalizeText(account.createdAt),
    UPDATED_AT: normalizeText(account.updatedAt),
  }));
}

export async function buildExcelExport(): Promise<Buffer> {
  const rows = await getExportRows();
  const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.aoa_to_sheet([
    ['ACCOUNT CODE SYSTEM EXPORT'],
    ['Live account records from the active Turso dataset'],
    [],
    ['Generated At', generatedAt, '', 'Total Records', rows.length],
    EXCEL_HEADERS as unknown as string[],
  ]);

  XLSX.utils.sheet_add_json(worksheet, rows, {
    origin: 'A6',
    skipHeader: true,
  });

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: EXCEL_HEADERS.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: EXCEL_HEADERS.length - 1 } },
  ];

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 28 },
    { wch: 44 },
    { wch: 16 },
    { wch: 36 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
  ];

  worksheet['!rows'] = [
    { hpt: 24 },
    { hpt: 18 },
    { hpt: 8 },
    { hpt: 18 },
    { hpt: 20 },
  ];

  worksheet['!autofilter'] = {
    ref: `A5:M${Math.max(rows.length + 5, 5)}`,
  };

  (worksheet as typeof worksheet & { '!freeze'?: unknown })['!freeze'] = {
    xSplit: 0,
    ySplit: 5,
    topLeftCell: 'A6',
    activePane: 'bottomLeft',
    state: 'frozen',
  };

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Account Export');

  return Buffer.from(
    XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
  );
}

export async function buildPdfExport(): Promise<Buffer> {
  const rows = await getExportRows();
  return buildStyledPdf(rows);
}
