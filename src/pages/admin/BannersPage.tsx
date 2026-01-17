import { useState } from 'react';
import { Plus, GripVertical, Eye, EyeOff, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

const initialBanners: Banner[] = [
  {
    id: '1',
    title: 'JCB New Launch',
    imageUrl: '/placeholder.svg',
    isActive: true,
    order: 1,
  },
  {
    id: '2',
    title: 'Ashok Leyland Offers',
    imageUrl: '/placeholder.svg',
    isActive: true,
    order: 2,
  },
  {
    id: '3',
    title: 'Switch EV Promotion',
    imageUrl: '/placeholder.svg',
    isActive: false,
    order: 3,
  },
];

function SortableBannerItem({
  banner,
  onToggle,
  onDelete,
}: {
  banner: Banner;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Banner Preview */}
      <div className="h-16 w-28 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Banner Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{banner.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={banner.isActive ? 'default' : 'secondary'}>
            {banner.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Position: {banner.order}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {banner.isActive ? (
            <Eye className="h-4 w-4 text-muted-foreground" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <Switch
            checked={banner.isActive}
            onCheckedChange={() => onToggle(banner.id)}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(banner.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBanners((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order numbers
        return newItems.map((item, index) => ({ ...item, order: index + 1 }));
      });
      toast({
        title: 'Order updated',
        description: 'Banner order has been saved.',
      });
    }
  }

  function toggleBanner(id: string) {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    toast({
      title: 'Banner updated',
      description: 'Banner visibility has been changed.',
    });
  }

  function deleteBanner(id: string) {
    setBanners((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      return filtered.map((item, index) => ({ ...item, order: index + 1 }));
    });
    toast({
      title: 'Banner deleted',
      description: 'The banner has been removed.',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
          <p className="text-muted-foreground">
            Manage homepage banners and promotional content
          </p>
        </div>
        <Button className="gradient-accent text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload New Banner</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop an image here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Recommended size: 1920x600px • Max size: 5MB • Formats: JPG, PNG, WebP
            </p>
            <Button variant="outline" className="mt-4">
              Choose File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Banners</CardTitle>
          <CardDescription>Drag to reorder banners. Changes are saved automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={banners.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {banners.map((banner) => (
                  <SortableBannerItem
                    key={banner.id}
                    banner={banner}
                    onToggle={toggleBanner}
                    onDelete={deleteBanner}
                  />
                ))}

                {banners.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No banners configured. Upload your first banner above.
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}
