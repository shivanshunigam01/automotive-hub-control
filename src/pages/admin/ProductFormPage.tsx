import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Upload, FileText, ChevronDown, ChevronUp, Trash2, ExternalLink, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TCOSection, type TCOItem } from '@/components/admin/TCOSection';
import { productsApi, type Product } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
//   price: string | number;
//   brochureUrl?: string;
//   brochureUpdatedAt?: string;
// };

type ProductFormData = {
name: string;
brand: string;
category: string;
price: string; // 👈 string in UI
shortDescription: string;
specifications: Record<string, string>;
images: string[];
isNewLaunch: boolean;
isBestseller: boolean;
isFeatured: boolean;
isActive: boolean;
seoTitle?: string;
seoDescription?: string;
tcoItems?: any[];
brochureUrl?: string;
brochureUpdatedAt?: string;
};

const initialFormData: ProductFormData = {
  name: '',
  brand: 'JCB',
  category: '',
  price: '0',
  shortDescription: '',
  specifications: {},
  images: [],
  isNewLaunch: false,
  isBestseller: false,
  isFeatured: false,
  isActive: true,
  seoTitle: '',
  seoDescription: '',
  tcoItems: [],
  brochureUrl: '',
  brochureUpdatedAt: '',
};

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
const [brochureFile, setBrochureFile] = useState<File | null>(null);
function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  if (!e.target.files) return;

  const files = Array.from(e.target.files);

  setImageFiles(prev => [...prev, ...files]);

  // 👇 create preview URLs
  const previewUrls = files.map(file => URL.createObjectURL(file));

  setFormData(prev => ({
    ...prev,
    images: [...prev.images, ...previewUrls],
  }));

  if (imageInputRef.current) {
    imageInputRef.current.value = '';
  }
}
function handleBrochureUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    toast({
      title: 'Invalid file',
      description: 'Please upload a PDF file',
      variant: 'destructive',
    });
    return;
  }

  setBrochureFile(file);

  // 👇 local preview URL
  const previewUrl = URL.createObjectURL(file);

  setFormData(prev => ({
    ...prev,
    brochureUrl: previewUrl,
    brochureUpdatedAt: new Date().toISOString(),
  }));

  if (brochureInputRef.current) {
    brochureInputRef.current.value = '';
  }
}
  // File input refs
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const brochureInputRef = React.useRef<HTMLInputElement>(null);

  // Handle image file selection
  // function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  //   const files = e.target.files;
  //   if (files && files.length > 0) {
  //     const newImages = Array.from(files).map(file => URL.createObjectURL(file));
  //     setFormData(prev => ({
  //       ...prev,
  //       images: [...prev.images, ...newImages]
  //     }));
  //     toast({
  //       title: 'Images added',
  //       description: `${files.length} image(s) added successfully.`,
  //     });
  //   }
  //   // Reset input
  //   if (imageInputRef.current) {
  //     imageInputRef.current.value = '';
  //   }
  // }

  // Handle brochure file selection
  // function handleBrochureUpload(e: React.ChangeEvent<HTMLInputElement>) {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     if (file.type !== 'application/pdf') {
  //       toast({
  //         title: 'Invalid file type',
  //         description: 'Please upload a PDF file for the brochure.',
  //         variant: 'destructive',
  //       });
  //       return;
  //     }
  //     const url = URL.createObjectURL(file);
  //     setFormData(prev => ({
  //       ...prev,
  //       brochureUrl: url,
  //       brochureUpdatedAt: new Date().toISOString()
  //     }));
  //     toast({
  //       title: 'Brochure uploaded',
  //       description: `${file.name} has been uploaded.`,
  //     });
  //   }
  //   // Reset input
  //   if (brochureInputRef.current) {
  //     brochureInputRef.current.value = '';
  //   }
  // }

  // Remove image
  function removeImage(index: number) {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  async function fetchProduct() {
    setIsLoading(true);
    try {
      const product = await productsApi.getById(id!);
      if (product) {
        setFormData({
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price?.toString() ?? '0', // ✅ FIX
          shortDescription: product.shortDescription,
          specifications: product.specifications,
          images: product.images,
          isNewLaunch: product.isNewLaunch,
          isBestseller: product.isBestseller,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          tcoItems: product.tcoItems || [],
          brochureUrl: product.brochureUrl
    ? `${API_BASE_URL}${product.brochureUrl.replace(/\\/g, '/')}`
    : '',
brochureUpdatedAt: product.updatedAt,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

async function handleSubmit(e: React.FormEvent, isDraft = false) {
  e.preventDefault();
  setIsSaving(true);

  try {
    const fd = new FormData();

    fd.append("name", formData.name);
    fd.append("brand", formData.brand);
    fd.append("category", formData.category);
    fd.append("price", String(Number(formData.price) || 0));
    fd.append("shortDescription", formData.shortDescription || "");
    fd.append("isActive", String(isDraft ? false : formData.isActive));
    fd.append("isNewLaunch", String(formData.isNewLaunch));
    fd.append("isBestseller", String(formData.isBestseller));
    fd.append("isFeatured", String(formData.isFeatured));
    fd.append("seoTitle", formData.seoTitle || "");
    fd.append("seoDescription", formData.seoDescription || "");
    fd.append("specifications", JSON.stringify(formData.specifications));
    fd.append("tcoItems", JSON.stringify(formData.tcoItems || []));

    // ✅ IMAGES → CLOUDINARY
    imageFiles.forEach(file => {
      fd.append("images", file);
    });

    // ✅ BROCHURE → SERVER
    if (brochureFile) {
      fd.append("brochure", brochureFile);
    }

    if (isEditing) {
      await productsApi.update(id!, fd as any);
    } else {
      await productsApi.create(fd as any);
    }

    toast({ title: "Success", description: "Product saved successfully" });
    navigate("/admin/products");
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to save product",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
}
  function addSpecification() {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        specifications: { ...formData.specifications, [specKey]: specValue },
      });
      setSpecKey('');
      setSpecValue('');
    }
  }

  function removeSpecification(key: string) {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({ ...formData, specifications: newSpecs });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update product details' : 'Create a new product listing'}
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., JCB 3DX Backhoe Loader"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value: Product['brand']) =>
                        setFormData({ ...formData, brand: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JCB">JCB</SelectItem>
                        <SelectItem value="Ashok Leyland">Ashok Leyland</SelectItem>
                        <SelectItem value="Switch EV">Switch EV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Backhoe Loader"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                 <Input
id="price"
type="number"
inputMode="numeric"
value={formData.price}
onChange={(e) => {
const value = e.target.value;


// allow empty while typing
if (value === '') {
setFormData({ ...formData, price: '' });
return;
}


setFormData({ ...formData, price: value });
}}
placeholder="0"
/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief description of the product..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>Add technical specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="Specification name"
                    className="flex-1"
                  />
                  <Input
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addSpecification}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {Object.entries(formData.specifications).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <span className="font-medium">{key}:</span>{' '}
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSpecification(key)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TCO Section */}
            <TCOSection
              tcoItems={formData.tcoItems || []}
              onChange={(tcoItems) => setFormData({ ...formData, tcoItems })}
            />

            {/* Brochure Upload */}
            <Card>
              <Collapsible defaultOpen={!!formData.brochureUrl}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-accent" />
                          Brochure (PDF)
                        </CardTitle>
                        <CardDescription>
                          Upload product brochure (PDF only)
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.brochureUrl && (
                          <span className="text-xs text-muted-foreground">
                            {formData.brochureUpdatedAt ? `Updated: ${new Date(formData.brochureUpdatedAt).toLocaleDateString()}` : 'Uploaded'}
                          </span>
                        )}
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {/* Hidden file input */}
                    <input
                      ref={brochureInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleBrochureUpload}
                      className="hidden"
                    />
                    
                    {!formData.brochureUrl ? (
                      <div 
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-muted/50 transition-colors"
                        onClick={() => brochureInputRef.current?.click()}
                      >
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop PDF here, or click to browse
                        </p>
                        <Button type="button" variant="outline" className="mt-4">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Brochure
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[250px]">
                              {formData.brochureUrl.split(/[\\/]/).pop() || 'brochure.pdf'}
                            </p>
                            <p className="text-xs text-muted-foreground">PDF Document</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => brochureInputRef.current?.click()}
                            title="Replace brochure"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(formData.brochureUrl, '_blank')}
                            title="Open brochure"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFormData({ ...formData, brochureUrl: '', brochureUpdatedAt: '' })}
                            title="Remove brochure"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-accent" />
                  Images
                </CardTitle>
                <CardDescription>Upload product images (JPG, PNG, WebP)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hidden file input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-muted/50 transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop images here, or click to browse
                  </p>
                  <Button type="button" variant="outline" className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                </div>

                {/* Image preview grid */}
           {formData.images.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
    {formData.images.map((img, index) => (
      <div key={index} className="relative group">
        <img
          src={img}
          className="w-full h-32 object-cover rounded-lg"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              images: prev.images.filter((_, i) => i !== index),
            }));
            setImageFiles(prev => prev.filter((_, i) => i !== index));
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    ))}
  </div>
)}
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle || ''}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="SEO optimized title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription || ''}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="SEO meta description"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Visibility */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Active</Label>
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="newLaunch">New Launch</Label>
                  <Switch
                    id="newLaunch"
                    checked={formData.isNewLaunch}
                    onCheckedChange={(checked) => setFormData({ ...formData, isNewLaunch: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="bestseller">Bestseller</Label>
                  <Switch
                    id="bestseller"
                    checked={formData.isBestseller}
                    onCheckedChange={(checked) => setFormData({ ...formData, isBestseller: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured</Label>
                  <Switch
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full gradient-accent text-accent-foreground"
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSaving}
                  onClick={(e) => handleSubmit(e, true)}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/admin/products')}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
