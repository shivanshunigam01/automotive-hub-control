import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type UnifiedStatus = StatusType | FinanceStatus;
type StatusType = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'converted' 
  | 'lost'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'inactive';

const statusConfig: Record<UnifiedStatus, { label: string; className: string }> = {
  // Leads
  new: { label: 'New', className: 'status-new' },
  contacted: { label: 'Contacted', className: 'bg-info/10 text-info border-info/20' },
  qualified: { label: 'Qualified', className: 'bg-accent/10 text-accent border-accent/20' },
  converted: { label: 'Converted', className: 'status-active' },
  lost: { label: 'Lost', className: 'status-closed' },

  // Common
  active: { label: 'Active', className: 'status-active' },
  inactive: { label: 'Inactive', className: 'status-closed' },

  // Finance
  pending: { label: 'New', className: 'status-new' },
  under_review: { label: 'Under Review', className: 'status-pending' },
  approved: { label: 'Approved', className: 'status-active' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  disbursed: { label: 'Disbursed', className: 'bg-success/10 text-success border-success/20' },
};

interface StatusBadgeProps {
  status: UnifiedStatus;
  className?: string;
}
export type FinanceStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "disbursed";
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
