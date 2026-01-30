import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  FileText,
  ExternalLink,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { usedVehiclesApi, type UsedVehicle } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UsedVehicleFormData = {
  vehicleType: string;
  brand: string;
  model: string;
  year: string;
  kilometers: string;
  hours: string;
  price: string;
  ownership: string;
  fuelType: string;
  location: string;

  conditionNotes: string;

  isActive: boolean;
  isCertified: boolean;
  financeAvailable: boolean;
  hasWarranty: boolean;
  hasReturnPolicy: boolean;

  images: string[];
  inspectionReportUrl?: string; // full URL for UI
};

const initialForm: UsedVehicleFormData = {
  vehicleType: "other",
  brand: "",
  model: "",
  year: "",
  kilometers: "",
  hours: "",
  price: "",
  ownership: "",
  fuelType: "",
  location: "",
  conditionNotes: "",
  isActive: true,
  isCertified: true,
  financeAvailable: true,
  hasWarranty: false,
  hasReturnPolicy: false,
  images: [],
  inspectionReportUrl: "",
};
export const VEHICLE_TYPES = [
  { value: "tipper", label: "Tipper" },
  { value: "bus", label: "Bus" },
  { value: "loader", label: "Loader" },
  { value: "jcb", label: "JCB / Backhoe Loader" },
  { value: "pickup", label: "Pickup" },
  { value: "lcv", label: "LCV" },
  { value: "trailer", label: "Trailer" },
  { value: "other", label: "Other" },
];

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const imageUrl = `${API_BASE_URL}${vehicle.featured_image}`;

export function UsedVehicleFormPage() {
  const { id } = useParams();
  const isEditing = !!id;

  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<UsedVehicleFormData>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [inspectionReportFile, setInspectionReportFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (isEditing) fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchVehicle() {
    setIsLoading(true);
    try {
      const vehicle = await usedVehiclesApi.getById(id!);

      // map backend -> UI
      setFormData({
        vehicleType: (vehicle as any).vehicle_type || vehicle.vehicleType || "other",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: String(vehicle.year || ""),
        kilometers: String(vehicle.kilometers || ""),
        hours: String(vehicle.hours || ""),
        price: String(vehicle.price || ""),
        ownership: vehicle.ownership || "",
        fuelType: (vehicle as any).fuel_type || vehicle.fuelType || "",
        location: (vehicle as any).location || "",
        conditionNotes: (vehicle as any).condition_report?.notes || "",

        isActive: (vehicle as any).is_active ?? vehicle.isActive ?? true,
        isCertified: (vehicle as any).is_certified ?? true,
        financeAvailable: (vehicle as any).finance_available ?? true,
        hasWarranty: (vehicle as any).has_warranty ?? false,
        hasReturnPolicy: (vehicle as any).has_return_policy ?? false,

        images: (vehicle as any).gallery_images || vehicle.images || [],
        inspectionReportUrl: (vehicle as any).inspection_report_url
          ? `${API_BASE_URL}${String((vehicle as any).inspection_report_url).replace(/\\/g, "/")}`
          : "",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch used vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    setImageFiles((prev) => [...prev, ...files]);

    const previewUrls = files.map((f) => URL.createObjectURL(f));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...previewUrls],
    }));

    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function handleInspectionReportUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setInspectionReportFile(file);

    // local preview url (only for UI until saved)
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      inspectionReportUrl: previewUrl,
    }));

    if (reportInputRef.current) reportInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const fd = new FormData();

      // ✅ IMPORTANT: backend expects snake_case keys
      fd.append("vehicle_type", formData.vehicleType);
      fd.append("brand", formData.brand);
      fd.append("model", formData.model);
      fd.append("year", String(Number(formData.year || 0)));
      fd.append("kilometers", String(Number(formData.kilometers || 0)));
      fd.append("hours", String(Number(formData.hours || 0)));
      fd.append("price", String(Number(formData.price || 0)));

      fd.append("ownership", formData.ownership);
      fd.append("fuel_type", formData.fuelType);
      fd.append("location", formData.location);

      fd.append("is_active", String(formData.isActive));
      fd.append("is_certified", String(formData.isCertified));
      fd.append("finance_available", String(formData.financeAvailable));
      fd.append("has_warranty", String(formData.hasWarranty));
      fd.append("has_return_policy", String(formData.hasReturnPolicy));

      fd.append(
        "condition_report",
        JSON.stringify({
          notes: formData.conditionNotes || "",
        })
      );

      // ✅ images
      imageFiles.forEach((f) => fd.append("images", f));

      // ✅ pdf
      if (inspectionReportFile) {
        fd.append("inspectionReport", inspectionReportFile);
      }

      if (isEditing) {
        await usedVehiclesApi.update(id!, fd);
      } else {
        await usedVehiclesApi.create(fd);
      }

      toast({ title: "Success", description: "Vehicle saved successfully" });
      navigate("/admin/certified-refurbished");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save vehicle",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function removeImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/certified-refurbished")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Certified Refurbished" : "Add Certified Refurbished"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update vehicle details" : "Create a new certified refurbished listing"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Vehicle Type *</Label>
                  <Select
  value={formData.vehicleType}
  onValueChange={(value) =>
    setFormData((prev) => ({ ...prev, vehicleType: value }))
  }
  required
>
  <SelectTrigger>
    <SelectValue placeholder="Select vehicle type" />
  </SelectTrigger>

  <SelectContent>
    {VEHICLE_TYPES.map((type) => (
      <SelectItem key={type.value} value={type.value}>
        {type.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

                  </div>

                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="JCB"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Model *</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="3DX"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Year *</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="2021"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Kilometers</Label>
                    <Input
                      type="number"
                      value={formData.kilometers}
                      onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hours</Label>
                    <Input
                      type="number"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="3500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1850000"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Ownership</Label>
                    <Input
                      value={formData.ownership}
                      onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                      placeholder="First Owner"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Input
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      placeholder="Diesel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Patna"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Condition Notes</Label>
                  <Textarea
                    value={formData.conditionNotes}
                    onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })}
                    placeholder="Minor scratches, engine checked..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inspection Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Inspection Report (PDF)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={reportInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleInspectionReportUpload}
                />

                {!formData.inspectionReportUrl ? (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-muted/50 transition-colors"
                    onClick={() => reportInputRef.current?.click()}
                  >
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload inspection report PDF</p>
                    <Button type="button" variant="outline" className="mt-4">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload PDF
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
                          {formData.inspectionReportUrl.split(/[\\/]/).pop() || "report.pdf"}
                        </p>
                        <p className="text-xs text-muted-foreground">PDF Document</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => reportInputRef.current?.click()}>
                        <Upload className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(formData.inspectionReportUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, inspectionReportUrl: "" }));
                          setInspectionReportFile(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-accent" />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />

                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-muted/50 transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload images</p>
                  <Button type="button" variant="outline" className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img} className="w-full h-32 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Certified</Label>
                  <Switch
                    checked={formData.isCertified}
                    onCheckedChange={(v) => setFormData({ ...formData, isCertified: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Finance Available</Label>
                  <Switch
                    checked={formData.financeAvailable}
                    onCheckedChange={(v) => setFormData({ ...formData, financeAvailable: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Warranty</Label>
                  <Switch
                    checked={formData.hasWarranty}
                    onCheckedChange={(v) => setFormData({ ...formData, hasWarranty: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Return Policy</Label>
                  <Switch
                    checked={formData.hasReturnPolicy}
                    onCheckedChange={(v) => setFormData({ ...formData, hasReturnPolicy: v })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full gradient-accent text-accent-foreground"
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : isEditing ? "Update Vehicle" : "Publish Vehicle"}
                </Button>

                <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/admin/certified-refurbished")}>
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
