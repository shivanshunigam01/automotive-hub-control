import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  new: { label: 'New', className: 'status-new' },
  contacted: { label: 'Contacted', className: 'bg-info/10 text-info border-info/20' },
  qualified: { label: 'Qualified', className: 'bg-accent/10 text-accent border-accent/20' },
  converted: { label: 'Converted', className: 'status-active' },
  lost: { label: 'Lost', className: 'status-closed' },
  under_review: { label: 'Under Review', className: 'status-pending' },
  approved: { label: 'Approved', className: 'status-active' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  active: { label: 'Active', className: 'status-active' },
  inactive: { label: 'Inactive', className: 'status-closed' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'status-closed' };
  
  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
