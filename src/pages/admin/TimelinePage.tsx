import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  Calendar as CalendarIcon,
  CalendarDays,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { timelineApi, formatImageUrl, type TimelineEvent } from '@/lib/api';
import { cn } from '@/lib/utils';

const IMAGE_TYPES = [
  'loan-mela', 'rural-activity', 'customer-meet', 'operator-meet',
  'exchange-mela', 'financer-meet', 'launch-event', 'road-show',
  'customer-testimony', 'customer-visit', 'group-event', 'others',
] as const;

const IMAGE_TYPE_LABELS: Record<typeof IMAGE_TYPES[number], string> = {
  'loan-mela': 'Loan Mela',
  'rural-activity': 'Rural Activity',
  'customer-meet': 'Customer Meet',
  'operator-meet': 'Operator Meet',
  'exchange-mela': 'Exchange Mela',
  'financer-meet': 'Financer Meet',
  'launch-event': 'Launch Event',
  'road-show': 'Road Show',
  'customer-testimony': 'Customer Testimony',
  'customer-visit': 'Customer Visit',
  'group-event': 'Group Event',
  'others': 'Others',
};

const emptyEvent: Partial<TimelineEvent> = {
  title: '',
  description: '',
  date: new Date().toISOString(),
  imageType: 'others',
  image: '',
  isActive: true,
  displayOrder: 0,
};

export function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<TimelineEvent> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermissions();

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setIsLoading(true);
    try {
      const data = await timelineApi.getAll();
      setEvents(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load timeline events', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateForm() {
    setEditingEvent({ ...emptyEvent });
    setImageFile(null);
    setImagePreview('');
    setSelectedDate(new Date());
    setIsFormOpen(true);
  }

  function openEditForm(event: TimelineEvent) {
    setEditingEvent({ ...event });
    setImageFile(null);
    setImagePreview(event.image ? formatImageUrl(event.image) : '');
    setSelectedDate(event.date ? parseISO(event.date) : new Date());
    setIsFormOpen(true);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview('');
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, image: '' });
    }
  }

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      setSelectedDate(date);
      setEditingEvent((prev) => prev && { ...prev, date: date.toISOString() });
    }
  }

  async function handleSave() {
    if (!editingEvent?.title || !selectedDate) {
      toast({ title: 'Title and Date are required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', editingEvent.title);
      formData.append('description', editingEvent.description || '');
      formData.append('date', selectedDate.toISOString());
      formData.append('imageType', editingEvent.imageType || 'others');
      formData.append('isActive', String(editingEvent.isActive ?? true));
      formData.append('displayOrder', String(editingEvent.displayOrder ?? 0));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (editingEvent.image) {
        formData.append('existingImage', editingEvent.image);
      }

      if (editingEvent._id) {
        await timelineApi.update(editingEvent._id, formData);
        toast({ title: 'Timeline event updated successfully' });
      } else {
        await timelineApi.create(formData);
        toast({ title: 'Timeline event created successfully' });
      }

      setIsFormOpen(false);
      fetchEvents();
    } catch {
      toast({ title: 'Failed to save timeline event', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await timelineApi.delete(id);
      toast({ title: 'Timeline event deleted' });
      fetchEvents();
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  }

  function formatEventDate(dateStr: string) {
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  }

  const filteredEvents = events
    .filter(
      (e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatEventDate(e.date).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.displayOrder - b.displayOrder);

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Timeline</h1>
          <p className="text-muted-foreground">Manage your company's milestones and history</p>
        </div>
        {canCreate('timeline') && (
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <DataTableSkeleton columns={6} rows={5} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No timeline events found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEvents.map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>
                          {event.image ? (
                            <img
                              src={formatImageUrl(event.image)}
                              alt={event.title}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatEventDate(event.date)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {IMAGE_TYPE_LABELS[event.imageType as typeof IMAGE_TYPES[number]] ?? event.imageType}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.displayOrder}</TableCell>
                        <TableCell>
                          <Badge variant={event.isActive ? 'default' : 'secondary'}>
                            {event.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit('timeline') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditForm(event)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete('timeline') && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Timeline Event</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{event.title}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(event._id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)} of{' '}
                    {filteredEvents.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent?._id ? 'Edit Timeline Event' : 'Add Timeline Event'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="e.g., Company Founded"
                value={editingEvent?.title || ''}
                onChange={(e) =>
                  setEditingEvent((prev) => prev && { ...prev, title: e.target.value })
                }
              />
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd MMMM yyyy') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this milestone..."
                value={editingEvent?.description || ''}
                onChange={(e) =>
                  setEditingEvent((prev) => prev && { ...prev, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Image Type */}
            <div className="space-y-2">
              <Label>Image Type</Label>
              <Select
                value={editingEvent?.imageType || 'others'}
                onValueChange={(val) =>
                  setEditingEvent((prev) => prev && { ...prev, imageType: val as TimelineEvent['imageType'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {IMAGE_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-48 rounded-lg object-cover border border-border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                placeholder="0"
                value={editingEvent?.displayOrder || 0}
                onChange={(e) =>
                  setEditingEvent((prev) => prev && { ...prev, displayOrder: Number(e.target.value) })
                }
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={editingEvent?.isActive ?? true}
                onCheckedChange={(checked) =>
                  setEditingEvent((prev) => prev && { ...prev, isActive: checked })
                }
              />
              <Label>Active</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : editingEvent?._id ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
