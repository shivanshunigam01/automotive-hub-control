import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Video,
  Star,
  Eye,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { useToast } from '@/hooks/use-toast';
import { mediaApi, type MediaItem } from '@/lib/api';

export function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('gallery');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleHi: '',
    mediaType: 'image' as 'image' | 'video',
    url: '',
    category: 'gallery' as 'gallery' | 'events' | 'testimonials',
    isFeatured: false,
    isActive: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setIsLoading(true);
    try {
      const data = await mediaApi.getAll();
      setItems(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch media items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingItem(null);
    setFormData({
      titleEn: '',
      titleHi: '',
      mediaType: 'image',
      url: '',
      category: activeTab === 'gallery' ? 'gallery' : 'events',
      isFeatured: false,
      isActive: true,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(item: MediaItem) {
    setEditingItem(item);
    setFormData({
      titleEn: item.titleEn,
      titleHi: item.titleHi,
      mediaType: item.mediaType,
      url: item.url,
      category: item.category,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit() {
    try {
      if (editingItem) {
        await mediaApi.update(editingItem.id, formData);
        toast({ title: 'Media updated successfully' });
      } else {
        await mediaApi.create(formData);
        toast({ title: 'Media added successfully' });
      }
      setIsDialogOpen(false);
      fetchItems();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save media',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await mediaApi.delete(id);
      toast({ title: 'Media deleted successfully' });
      fetchItems();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete media',
        variant: 'destructive',
      });
    }
  }

  async function toggleFeatured(item: MediaItem) {
    try {
      await mediaApi.update(item.id, { isFeatured: !item.isFeatured });
      toast({
        title: item.isFeatured ? 'Removed from featured' : 'Added to featured',
      });
      fetchItems();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update',
        variant: 'destructive',
      });
    }
  }

  const galleryItems = items.filter(
    (i) =>
      i.category === 'gallery' &&
      (i.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.titleHi.includes(searchQuery))
  );

  const albumItems = items.filter(
    (i) =>
      (i.category === 'events' || i.category === 'testimonials') &&
      (i.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.titleHi.includes(searchQuery))
  );

  const renderMediaGrid = (mediaItems: MediaItem[]) => (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {mediaItems.map((item) => (
        <Card key={item.id} className="group overflow-hidden">
          <div className="relative aspect-video bg-muted">
            {item.mediaType === 'image' ? (
              <img
                src={item.url || '/placeholder.svg'}
                alt={item.titleEn}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => openEditDialog(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => toggleFeatured(item)}
              >
                <Star
                  className={`h-4 w-4 ${item.isFeatured ? 'fill-yellow-400 text-yellow-400' : ''}`}
                />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {item.isFeatured && (
              <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-950">
                Featured
              </Badge>
            )}
            {!item.isActive && (
              <Badge className="absolute top-2 left-2" variant="secondary">
                Inactive
              </Badge>
            )}
          </div>
          <CardContent className="p-3">
            <p className="font-medium truncate">{item.titleEn}</p>
            <p className="text-sm text-muted-foreground truncate">{item.titleHi}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {item.mediaType === 'image' ? (
                  <ImageIcon className="mr-1 h-3 w-3" />
                ) : (
                  <Video className="mr-1 h-3 w-3" />
                )}
                {item.mediaType}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {item.category}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Manage gallery images, videos, and company albums
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gradient-accent text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Media
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gallery" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Gallery ({galleryItems.length})
          </TabsTrigger>
          <TabsTrigger value="albums" className="gap-2">
            <Video className="h-4 w-4" />
            Company Albums ({albumItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="mt-6">
          {isLoading ? (
            <DataTableSkeleton columns={4} rows={2} />
          ) : galleryItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No gallery items found
              </CardContent>
            </Card>
          ) : (
            renderMediaGrid(galleryItems)
          )}
        </TabsContent>

        <TabsContent value="albums" className="mt-6">
          {isLoading ? (
            <DataTableSkeleton columns={4} rows={2} />
          ) : albumItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No album items found
              </CardContent>
            </Card>
          ) : (
            renderMediaGrid(albumItems)
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Media' : 'Add Media'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update media information' : 'Add a new media item'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titleEn">Title (English)</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="Enter title in English"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleHi">Title (Hindi)</Label>
              <Input
                id="titleHi"
                value={formData.titleHi}
                onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                placeholder="हिंदी में शीर्षक दर्ज करें"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mediaType">Media Type</Label>
              <Select
                value={formData.mediaType}
                onValueChange={(value: 'image' | 'video') =>
                  setFormData({ ...formData, mediaType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL / Upload</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="Enter URL or upload file"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: 'gallery' | 'events' | 'testimonials') =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gallery">Gallery</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="testimonials">Testimonials</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured</Label>
              <Switch
                id="featured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gradient-accent text-accent-foreground">
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}