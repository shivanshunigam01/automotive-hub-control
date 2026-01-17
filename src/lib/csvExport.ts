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
