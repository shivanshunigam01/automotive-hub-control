import { useEffect, useState } from 'react';
import {
  Search, Plus, Pencil, Trash2, Eye, Download, Briefcase, Users,
  ChevronLeft, ChevronRight, X, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { careersApi, type JobOpening, type JobApplication } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 20;

const emptyOpening: Partial<JobOpening> = {
  title: '',
  location: '',
  experience: '',
  employmentType: 'Full Time',
  description: '',
  qualifications: [''],
  isActive: true,
  priority: 0,
};

export function CareersPage() {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { toast } = useToast();

  // ── Job Openings state ──
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [isLoadingOpenings, setIsLoadingOpenings] = useState(true);
  const [searchOpenings, setSearchOpenings] = useState('');
  const [openingPage, setOpeningPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpening, setEditingOpening] = useState<Partial<JobOpening> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Job Applications state ──
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [searchApps, setSearchApps] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [appPage, setAppPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);

  // ── Fetch ──
  useEffect(() => { fetchOpenings(); }, [searchOpenings]);
  useEffect(() => { fetchApplications(); }, [searchApps, statusFilter, jobFilter]);

  async function fetchOpenings() {
    setIsLoadingOpenings(true);
    try {
      const data = await careersApi.getAllOpenings({ search: searchOpenings || undefined });
      setOpenings(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch job openings.', variant: 'destructive' });
    } finally {
      setIsLoadingOpenings(false);
    }
  }

  async function fetchApplications() {
    setIsLoadingApps(true);
    try {
      const data = await careersApi.getAllApplications({
        search: searchApps || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        jobId: jobFilter !== 'all' ? jobFilter : undefined,
      });
      setApplications(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch applications.', variant: 'destructive' });
    } finally {
      setIsLoadingApps(false);
    }
  }

  // ── Opening CRUD ──
  function handleNewOpening() {
    setEditingOpening({ ...emptyOpening });
    setIsFormOpen(true);
  }

  function handleEditOpening(opening: JobOpening) {
    setEditingOpening({ ...opening });
    setIsFormOpen(true);
  }

  async function handleSaveOpening() {
    if (!editingOpening) return;
    setIsSaving(true);
    try {
      const payload = {
        ...editingOpening,
        qualifications: editingOpening.qualifications?.filter((q) => q.trim() !== ''),
      };
      if (editingOpening._id) {
        await careersApi.updateOpening(editingOpening._id, payload);
        toast({ title: 'Job opening updated' });
      } else {
        await careersApi.createOpening(payload);
        toast({ title: 'Job opening created' });
      }
      setIsFormOpen(false);
      setEditingOpening(null);
      fetchOpenings();
    } catch {
      toast({ title: 'Error', description: 'Failed to save job opening.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteOpening() {
    if (!deleteId) return;
    try {
      await careersApi.deleteOpening(deleteId);
      toast({ title: 'Job opening deleted' });
      fetchOpenings();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  }

  // ── Application actions ──
  async function handleUpdateAppStatus(id: string, status: JobApplication['status']) {
    try {
      await careersApi.updateApplicationStatus(id, status);
      toast({ title: `Application marked as ${status}` });
      fetchApplications();
      if (selectedApp?._id === id) setSelectedApp((prev) => prev ? { ...prev, status } : null);
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  }

  async function handleDeleteApplication() {
    if (!deleteAppId) return;
    try {
      await careersApi.deleteApplication(deleteAppId);
      toast({ title: 'Application deleted' });
      fetchApplications();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    } finally {
      setDeleteAppId(null);
    }
  }

  // ── Qualification helpers ──
  function addQualification() {
    if (!editingOpening) return;
    setEditingOpening({ ...editingOpening, qualifications: [...(editingOpening.qualifications || []), ''] });
  }
  function updateQualification(idx: number, val: string) {
    if (!editingOpening) return;
    const q = [...(editingOpening.qualifications || [])];
    q[idx] = val;
    setEditingOpening({ ...editingOpening, qualifications: q });
  }
  function removeQualification(idx: number) {
    if (!editingOpening) return;
    const q = [...(editingOpening.qualifications || [])];
    q.splice(idx, 1);
    setEditingOpening({ ...editingOpening, qualifications: q });
  }

  // ── Pagination ──
  const filteredOpenings = openings;
  const totalOpeningPages = Math.ceil(filteredOpenings.length / ITEMS_PER_PAGE);
  const paginatedOpenings = filteredOpenings.slice((openingPage - 1) * ITEMS_PER_PAGE, openingPage * ITEMS_PER_PAGE);

  const filteredApps = applications;
  const totalAppPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
  const paginatedApps = filteredApps.slice((appPage - 1) * ITEMS_PER_PAGE, appPage * ITEMS_PER_PAGE);

  const appStatusColor: Record<string, string> = {
    new: 'info',
    reviewed: 'warning',
    shortlisted: 'success',
    rejected: 'destructive',
    hired: 'success',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Careers Management</h1>
        <p className="text-muted-foreground">Manage job openings and view applications</p>
      </div>

      <Tabs defaultValue="openings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="openings" className="gap-2">
            <Briefcase className="h-4 w-4" /> Job Openings
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <Users className="h-4 w-4" /> Applications
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════ JOB OPENINGS TAB ═══════════════ */}
        <TabsContent value="openings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Job Openings ({filteredOpenings.length})</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search openings..."
                      value={searchOpenings}
                      onChange={(e) => { setSearchOpenings(e.target.value); setOpeningPage(1); }}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  {canCreate('careers') && (
                    <Button onClick={handleNewOpening} className="gap-2">
                      <Plus className="h-4 w-4" /> Add Opening
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingOpenings ? (
                <DataTableSkeleton columns={7} />
              ) : filteredOpenings.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No job openings found.</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOpenings.map((opening) => (
                        <TableRow key={opening._id}>
                          <TableCell className="font-medium">{opening.title}</TableCell>
                          <TableCell>{opening.location}</TableCell>
                          <TableCell>{opening.experience}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{opening.employmentType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={opening.isActive ? 'default' : 'secondary'}>
                              {opening.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{opening.priority}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {canEdit('careers') && (
                                <Button variant="ghost" size="icon" onClick={() => handleEditOpening(opening)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete('careers') && (
                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(opening._id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalOpeningPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {(openingPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(openingPage * ITEMS_PER_PAGE, filteredOpenings.length)} of {filteredOpenings.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={openingPage === 1} onClick={() => setOpeningPage((p) => p - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">Page {openingPage} of {totalOpeningPages}</span>
                        <Button variant="outline" size="sm" disabled={openingPage === totalOpeningPages} onClick={() => setOpeningPage((p) => p + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ APPLICATIONS TAB ═══════════════ */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Job Applications ({filteredApps.length})</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search applications..."
                      value={searchApps}
                      onChange={(e) => { setSearchApps(e.target.value); setAppPage(1); }}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setAppPage(1); }}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                    </SelectContent>
                  </Select>
                  {openings.length > 0 && (
                    <Select value={jobFilter} onValueChange={(v) => { setJobFilter(v); setAppPage(1); }}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Job" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        {openings.map((o) => (
                          <SelectItem key={o._id} value={o._id}>{o.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingApps ? (
                <DataTableSkeleton columns={7} />
              ) : filteredApps.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No applications found.</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedApps.map((app) => (
                        <TableRow key={app._id}>
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.mobile}</TableCell>
                          <TableCell>{app.jobTitle || '—'}</TableCell>
                          <TableCell>
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell>{new Date(app.createdAt).toLocaleDateString('en-IN')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setSelectedApp(app)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {app.resumeUrl && (
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {canDelete('careers') && (
                                <Button variant="ghost" size="icon" onClick={() => setDeleteAppId(app._id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalAppPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {(appPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(appPage * ITEMS_PER_PAGE, filteredApps.length)} of {filteredApps.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={appPage === 1} onClick={() => setAppPage((p) => p - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">Page {appPage} of {totalAppPages}</span>
                        <Button variant="outline" size="sm" disabled={appPage === totalAppPages} onClick={() => setAppPage((p) => p + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══════════════ CREATE/EDIT OPENING DIALOG ═══════════════ */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOpening?._id ? 'Edit Job Opening' : 'Create Job Opening'}</DialogTitle>
            <DialogDescription>Fill in the details for the job opening.</DialogDescription>
          </DialogHeader>
          {editingOpening && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={editingOpening.title || ''}
                    onChange={(e) => setEditingOpening({ ...editingOpening, title: e.target.value })}
                    placeholder="e.g. Sales Executive - JCB Machines"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    value={editingOpening.location || ''}
                    onChange={(e) => setEditingOpening({ ...editingOpening, location: e.target.value })}
                    placeholder="e.g. Patna, Bihar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experience *</Label>
                  <Input
                    value={editingOpening.experience || ''}
                    onChange={(e) => setEditingOpening({ ...editingOpening, experience: e.target.value })}
                    placeholder="e.g. 2-4 Years"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select
                    value={editingOpening.employmentType || 'Full Time'}
                    onValueChange={(v) => setEditingOpening({ ...editingOpening, employmentType: v as JobOpening['employmentType'] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Part Time">Part Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority (higher = shown first)</Label>
                  <Input
                    type="number"
                    value={editingOpening.priority ?? 0}
                    onChange={(e) => setEditingOpening({ ...editingOpening, priority: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={editingOpening.isActive ?? true}
                    onCheckedChange={(v) => setEditingOpening({ ...editingOpening, isActive: v })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Job Description *</Label>
                <Textarea
                  value={editingOpening.description || ''}
                  onChange={(e) => setEditingOpening({ ...editingOpening, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the role, responsibilities..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Qualifications</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQualification}>
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                {editingOpening.qualifications?.map((q, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={q}
                      onChange={(e) => updateQualification(idx, e.target.value)}
                      placeholder={`Qualification ${idx + 1}`}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeQualification(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveOpening} disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingOpening._id ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════ APPLICATION DETAIL DIALOG ═══════════════ */}
      <Dialog open={!!selectedApp} onOpenChange={(v) => !v && setSelectedApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review the candidate&apos;s application</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium">{selectedApp.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile</span>
                  <p className="font-medium">{selectedApp.mobile}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">{selectedApp.email}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Applied For</span>
                  <p className="font-medium">{selectedApp.jobTitle || '—'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Resume / CV</span>
                  {selectedApp.resumeUrl ? (
                    <a href={selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary underline">
                      <ExternalLink className="h-3 w-3" /> View Resume
                    </a>
                  ) : (
                    <p className="text-muted-foreground">Not provided</p>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Why should we hire you?</span>
                  <p className="mt-1 rounded-md border p-3 text-sm bg-muted/50">{selectedApp.whyShouldWeHire || '—'}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select
                  value={selectedApp.status}
                  onValueChange={(v) => handleUpdateAppStatus(selectedApp._id, v as JobApplication['status'])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════ DELETE CONFIRMATIONS ═══════════════ */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Opening?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOpening} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteAppId} onOpenChange={(v) => !v && setDeleteAppId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteApplication} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
