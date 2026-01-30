import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Image as ImageIcon,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTableSkeleton } from "@/components/admin/DataTableSkeleton";
import { useToast } from "@/hooks/use-toast";
import { mediaApi, type MediaItem } from "@/lib/api";

export function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setIsLoading(true);
    try {
      const data = await mediaApi.getAll();
      setItems(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load media",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(file: File) {
    try {
      await mediaApi.uploadSingle(file, "gallery");
      toast({ title: "Media uploaded successfully" });
      setIsUploadOpen(false);
      fetchMedia();
    } catch {
      toast({
        title: "Upload failed",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await mediaApi.delete(id);
      toast({ title: "Media deleted" });
      fetchMedia();
    } catch {
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    }
  }

  const filteredItems = items.filter(
    (i) =>
      i.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Upload and manage images, videos, and documents
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          className="gradient-accent text-accent-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Media
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      {isLoading ? (
        <DataTableSkeleton columns={4} rows={2} />
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No media files found
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const isImage = item.mime_type?.startsWith("image");
            const isVideo = item.mime_type?.startsWith("video");

            return (
              <Card key={item.id} className="group overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.original_filename}
                      className="h-full w-full object-cover"
                    />
                  ) : isVideo ? (
                    <div className="flex h-full items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      FILE
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="icon"
                      variant="destructive"
                   onClick={() => {
  if (!item.id) {
    toast({
      title: "Invalid media item",
      variant: "destructive",
    });
    return;
  }
  handleDelete(item.id);
}}

                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-3 space-y-1">
                  <p className="font-medium truncate">
                    {item.original_filename || item.filename}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.mime_type}
                  </p>

                  <div className="flex gap-2 pt-1">
                    <Badge variant="outline" className="text-xs">
                      {isImage ? <ImageIcon className="mr-1 h-3 w-3" /> : <Video className="mr-1 h-3 w-3" />}
                      {isImage ? "Image" : isVideo ? "Video" : "File"}
                    </Badge>
                    {item.size && (
                      <Badge variant="outline" className="text-xs">
                        {(item.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>

          <input
            type="file"
            accept="image/*,video/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
