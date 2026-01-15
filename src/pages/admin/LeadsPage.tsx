import { useEffect, useState } from 'react';
import { Search, Filter, Phone, Mail, Eye } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { leadsApi, type Lead } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, searchQuery]);

  async function fetchLeads() {
    setIsLoading(true);
    try {
      const data = await leadsApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      setLeads(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: Lead['status']) {
    try {
      await leadsApi.updateStatus(id, status);
      toast({
        title: 'Status updated',
        description: 'Lead status has been updated successfully.',
      });
      fetchLeads();
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  }

  async function handleAddNote() {
    if (!selectedLead || !newNote.trim()) return;

    try {
      const updatedLead = await leadsApi.addNote(selectedLead.id, newNote);
      setSelectedLead(updatedLead);
      setNewNote('');
      toast({
        title: 'Note added',
        description: 'Note has been added to the lead.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Manage customer inquiries and track conversions
        </p>
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
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads ({leads.length})</CardTitle>
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
                    <TableHead>Contact</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead) => (
                      <TableRow key={lead.id} className="table-row-hover">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-accent">
                                {lead.customerName.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium">{lead.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {lead.mobile}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.productName || 'General'}</p>
                            {lead.brand && (
                              <Badge variant="outline" className="mt-1">
                                {lead.brand}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{lead.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={lead.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedLead(lead)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Lead Details</DialogTitle>
                                <DialogDescription>
                                  {selectedLead?.customerName}
                                </DialogDescription>
                              </DialogHeader>

                              {selectedLead && (
                                <div className="space-y-6">
                                  {/* Customer Info */}
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <p className="text-sm text-muted-foreground">Name</p>
                                      <p className="font-medium">{selectedLead.customerName}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm text-muted-foreground">Mobile</p>
                                      <p className="font-medium">{selectedLead.mobile}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm text-muted-foreground">Email</p>
                                      <p className="font-medium">{selectedLead.email}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm text-muted-foreground">Source</p>
                                      <p className="font-medium">{selectedLead.source}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Product Interest */}
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Product Interest</p>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {selectedLead.productName || 'General Inquiry'}
                                      </span>
                                      {selectedLead.brand && (
                                        <Badge variant="outline">{selectedLead.brand}</Badge>
                                      )}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Status Update */}
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Select
                                      value={selectedLead.status}
                                      onValueChange={(value: Lead['status']) =>
                                        handleStatusChange(selectedLead.id, value)
                                      }
                                    >
                                      <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                        <SelectItem value="qualified">Qualified</SelectItem>
                                        <SelectItem value="converted">Converted</SelectItem>
                                        <SelectItem value="lost">Lost</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Separator />

                                  {/* Notes */}
                                  <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    
                                    {selectedLead.notes.length > 0 && (
                                      <div className="space-y-2">
                                        {selectedLead.notes.map((note, index) => (
                                          <div
                                            key={index}
                                            className="p-3 bg-muted rounded-lg text-sm"
                                          >
                                            {note}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <div className="flex gap-2">
                                      <Textarea
                                        placeholder="Add a note..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        rows={2}
                                      />
                                    </div>
                                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                      Add Note
                                    </Button>
                                  </div>

                                  {/* UTM Data */}
                                  {(selectedLead.utmSource || selectedLead.utmMedium || selectedLead.utmCampaign) && (
                                    <>
                                      <Separator />
                                      <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">UTM Data</p>
                                        <div className="grid gap-2 text-sm">
                                          {selectedLead.utmSource && (
                                            <p><strong>Source:</strong> {selectedLead.utmSource}</p>
                                          )}
                                          {selectedLead.utmMedium && (
                                            <p><strong>Medium:</strong> {selectedLead.utmMedium}</p>
                                          )}
                                          {selectedLead.utmCampaign && (
                                            <p><strong>Campaign:</strong> {selectedLead.utmCampaign}</p>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}
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
