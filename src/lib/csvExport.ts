import type { Lead } from '@/lib/api';

export function exportLeadsToCSV(leads: Lead[]): void {
  const headers = [
    'Lead ID',
    'Date',
    'Name',
    'Mobile',
    'Email',
    'Brand',
    'Product',
    'Status',
    'Assigned To',
    'Source',
  ];

  const csvContent = [
    headers.join(','),
    ...leads.map((lead) => [
      lead.id,
      new Date(lead.createdAt).toLocaleDateString(),
      `"${lead.customerName}"`,
      lead.mobile,
      lead.email,
      lead.brand || '',
      `"${lead.productName || ''}"`,
      lead.status,
      lead.assignedTo || '',
      lead.source,
    ].join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCibilToCSV(checks: Array<{
  id: string;
  customerName: string;
  mobile: string;
  score: number;
  scoreBand: string;
  checkedAt: string;
}>): void {
  const headers = [
    'Check ID',
    'Date',
    'Customer Name',
    'Mobile',
    'Score',
    'Score Band',
  ];

  const csvContent = [
    headers.join(','),
    ...checks.map((check) => [
      check.id,
      new Date(check.checkedAt).toLocaleDateString(),
      `"${check.customerName}"`,
      check.mobile,
      check.score,
      check.scoreBand,
    ].join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `cibil_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCibilPageToExcel(
  checks: Array<{
    customerName: string;
    mobile: string;
    panNumber: string;
    aadhaarNumber?: string | null;
    score: number;
    scoreBand: string;
    checkedAt: string;
  }>,
  page: number
): void {
  const headers = [
    "Customer Name",
    "Mobile",
    "PAN",
    "Aadhaar",
    "Score",
    "Score Band",
    "Checked Date",
    "Checked Time",
  ];

  const rows = checks.map((check) => {
    const dt = new Date(check.checkedAt);
    return [
      check.customerName,
      check.mobile,
      check.panNumber || "",
      check.aadhaarNumber || "",
      String(check.score ?? ""),
      check.scoreBand || "",
      Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString(),
      Number.isNaN(dt.getTime()) ? "" : dt.toLocaleTimeString(),
    ];
  });

  const tabSeparated = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join("\t")
    )
    .join("\n");

  const blob = new Blob([tabSeparated], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `cibil_page_${page}_${new Date().toISOString().split("T")[0]}.xls`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
