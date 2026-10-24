export type ReportReservation = {
  id: string;
  customerName?: string;
  courtName?: string;
  date: string;
  fromHour: number;
  toHour: number;
  status: string;
  paymentStatus: string;
  price: number;
};

const escapeXml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const escapePdf = (value: unknown) => String(value ?? '')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)')
  .replace(/[^\x20-\x7E]/g, '?');

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const reportRows = (reservations: ReportReservation[]) => reservations.map(reservation => [
  reservation.id,
  reservation.customerName || 'Guest',
  reservation.courtName || 'Court',
  reservation.date,
  `${reservation.fromHour}:00 - ${reservation.toHour}:00`,
  reservation.status,
  reservation.paymentStatus,
  reservation.price.toFixed(2),
]);

export function downloadExcelReport(reservations: ReportReservation[]) {
  const headers = ['Booking ID', 'Customer', 'Court', 'Date', 'Time', 'Status', 'Payment', 'Amount (EGP)'];
  const rows = reportRows(reservations);
  const tableRows = [headers, ...rows]
    .map(row => `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`)
    .join('');
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Reservations"><Table>${tableRows}</Table></Worksheet></Workbook>`;
  download(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }), 'yalla-match-reservations.xls');
}

export function downloadRefundsReport(refunds: { id: string; reservationId: string; courtName?: string; customerName?: string; customerPhone?: string; date: string; fromHour: number; toHour: number; amount: number; reason?: string; refundedAtUtc: string; }[]) {
  const headers = ['Refund ID', 'Reservation ID', 'Customer', 'Court', 'Date', 'Time', 'Amount (EGP)', 'Reason', 'Refunded At'];
  const rows = refunds.map(refund => [refund.id, refund.reservationId, refund.customerName || 'Guest', refund.courtName || 'Court', refund.date, `${refund.fromHour}:00 - ${refund.toHour}:00`, refund.amount.toFixed(2), refund.reason || 'No note', new Date(refund.refundedAtUtc).toLocaleString()]);
  const tableRows = [headers, ...rows]
    .map(row => `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`)
    .join('');
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Refunds"><Table>${tableRows}</Table></Worksheet></Workbook>`;
  download(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }), 'yalla-match-refunds.xls');
}

export function downloadActivityReport(activity: { timestamp: string; action: string; customer: string; court: string; date: string; time: string; status: string; payment: string; amount: string; note: string; }[]) {
  const headers = ['Timestamp', 'Action', 'Customer', 'Court', 'Date', 'Time', 'Status', 'Payment', 'Amount', 'Note'];
  const rows = activity.map(entry => [new Date(entry.timestamp).toLocaleString(), entry.action, entry.customer, entry.court, entry.date, entry.time, entry.status, entry.payment, entry.amount, entry.note]);
  const tableRows = [headers, ...rows]
    .map(row => `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`)
    .join('');
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Activity"><Table>${tableRows}</Table></Worksheet></Workbook>`;
  download(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }), 'yalla-match-activity.xls');
}

export function downloadCourtsReport(courts: { id: string; name: string; place: string; sportType?: string; price: number; paymentPhone?: string; }[], reservations: { courtId: string }[]) {
  const headers = ['Court ID', 'Name', 'Sport', 'Place', 'Hourly Price (EGP)', 'Payment Phone', 'Bookings Count'];
  const rows = courts.map(court => {
    const count = reservations.filter(r => r.courtId === court.id).length;
    return [
      court.id,
      court.name,
      court.sportType || 'Football',
      court.place,
      court.price.toFixed(2),
      court.paymentPhone || '',
      String(count)
    ];
  });
  const tableRows = [headers, ...rows]
    .map(row => `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`)
    .join('');
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Courts"><Table>${tableRows}</Table></Worksheet></Workbook>`;
  download(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }), 'yalla-match-courts.xls');
}

export function downloadAuditLogsReport(logs: { id: string; timestamp: string; adminEmail: string; adminRole: string; category: string; action: string; details: string }[]) {
  const headers = ['ID', 'Timestamp', 'Admin Email', 'Role', 'Category', 'Action', 'Details'];
  const rows = logs.map(log => [
    log.id,
    new Date(log.timestamp).toLocaleString(),
    log.adminEmail,
    log.adminRole,
    log.category,
    log.action,
    log.details
  ]);
  const tableRows = [headers, ...rows]
    .map(row => `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`)
    .join('');
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Admin Audit Logs"><Table>${tableRows}</Table></Worksheet></Workbook>`;
  download(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }), 'yalla-match-admin-audit-logs.xls');
}

export function downloadPdfReport(reservations: ReportReservation[]) {
  const headers = ['Yalla Match Reservations Report', `Generated: ${new Date().toLocaleString()}`, `Records: ${reservations.length}`, ''];
  const rows = reportRows(reservations).map(row => `${row[3]} | ${row[1]} | ${row[2]} | ${row[4]} | ${row[5]} | EGP ${row[7]}`);
  const pages = [...headers, ...rows].reduce<string[][]>((all, line, index) => {
    const page = Math.floor(index / 42);
    (all[page] ??= []).push(line);
    return all;
  }, []);
  const objects: string[] = [];
  const pageIds = pages.map((_, index) => 3 + index * 2);
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  pages.forEach((page, index) => {
    const pageId = 3 + index * 2;
    const contentId = pageId + 1;
    const text = page.map((line, lineIndex) => `${lineIndex === 0 ? 'BT /F1 12 Tf 40 800 Td' : '0 -18 Td'} (${escapePdf(line)}) Tj`).join('\n') + '\nET';
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${text.length} >>\nstream\n${text}\nendstream`);
  });
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  download(new Blob([pdf], { type: 'application/pdf' }), 'yalla-match-reservations.pdf');
}
