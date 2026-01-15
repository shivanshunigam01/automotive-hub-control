import { useEffect, useState } from 'react';
import { Search, Filter, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { financeApi, type FinanceApplication } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function FinancePage() {
  const [applications, setApplications] = useState<FinanceApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<FinanceApplication | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setIsLoading(true);
    try {
      const data = await financeApi.getAll();
      setApplications(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: FinanceApplication['status']) {
    try {
      await financeApi.updateStatus(id, status);
      toast({
        title: 'Status updated',
        description: 'Application status has been updated successfully.',
      });
      fetchApplications();
      if (selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  }

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.mobile.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Applications</h1>
        <p className="text-muted-foreground">
          Review and manage loan applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {['new', 'under_review', 'approved', 'rejected'].map((status) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {applications.filter((a) => a.status === status).length}
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {status.replace('_', ' ')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications ({filteredApps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columns={6} rows={5} />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Tenure</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApps.map((app) => (
                      <TableRow key={app.id} className="table-row-hover">
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.customerName}</p>
                            <p className="text-sm text-muted-foreground">{app.mobile}</p>
                          </div>
                        </TableCell>
                        <TableCell>{app.productName || 'N/A'}</TableCell>
                        <TableCell className="font-medium">
                          ₹{app.loanAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{app.tenure} months</TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedApp(app)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                              <DialogHeader>
                                <DialogTitle>Finance Application</DialogTitle>
                                <DialogDescription>
                                  Application #{selectedApp?.id}
                                </DialogDescription>
                              </DialogHeader>

                              {selectedApp && (
                                <div className="space-y-6">
                                  {/* Customer Info */}
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Customer</p>
                                      <p className="font-medium">{selectedApp.customerName}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Mobile</p>
                                      <p className="font-medium">{selectedApp.mobile}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Email</p>
                                      <p className="font-medium">{selectedApp.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Product</p>
                                      <p className="font-medium">{selectedApp.productName || 'N/A'}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Loan Details */}
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Loan Amount</p>
                                      <p className="text-2xl font-bold">
                                        ₹{selectedApp.loanAmount.toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Tenure</p>
                                      <p className="text-2xl font-bold">{selectedApp.tenure} months</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Status */}
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Update Status</p>
                                    <Select
                                      value={selectedApp.status}
                                      onValueChange={(value: FinanceApplication['status']) =>
                                        handleStatusChange(selectedApp.id, value)
                                      }
                                    >
                                      <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="under_review">Under Review</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Separator />

                                  {/* Documents */}
                                  <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">Submitted Documents</p>
                                    {selectedApp.documents.length === 0 ? (
                                      <p className="text-sm text-muted-foreground">No documents uploaded</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {selectedApp.documents.map((doc, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                          >
                                            <div className="flex items-center gap-2">
                                              <FileText className="h-4 w-4 text-muted-foreground" />
                                              <span className="text-sm font-medium">{doc.type}</span>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                              <Download className="h-4 w-4 mr-2" />
                                              Download
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
