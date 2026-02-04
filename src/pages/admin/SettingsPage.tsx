import { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Clock, Settings2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { settingsApi } from '@/lib/api';

interface FeatureToggles {
  emiCalculator: boolean;
  usedVehicles: boolean;
  cibilCheck: boolean;
  comparison: boolean;
}

export function SettingsPage() {
  const { toast } = useToast();
  const { canEdit } = usePermissions();
  const canEditSettings = canEdit('settings');
  const [isSaving, setIsSaving] = useState(false);

  const [siteSettings, setSiteSettings] = useState({
    primaryPhone: '',
    secondaryPhone: '',
    whatsappNumber: '',
    email: '',
    address: '',
    workingHours: '',
  });

  const [features, setFeatures] = useState<FeatureToggles>({
    emiCalculator: true,
    usedVehicles: true,
    cibilCheck: true,
    comparison: true,
  });

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await settingsApi.getAdmin();
      if (!data) return;

      setSiteSettings({
        primaryPhone: data.primary_phone || '',
        secondaryPhone: '',
        whatsappNumber: data.whatsapp_number || '',
        email: data.email || '',
        address: data.address || '',
        workingHours: data.working_hours || '',
      });

      setFeatures({
        emiCalculator: !!data.features?.emiCalculator,
        usedVehicles: !!data.features?.usedVehicles,
        cibilCheck: !!data.features?.cibilCheck,
        comparison: !!data.features?.comparison,
      });
    } catch {
      toast({
        title: 'Failed to load settings',
        variant: 'destructive',
      });
    }
  }

  /* ================= SAVE SETTINGS ================= */
  async function handleSave() {
    if (!canEditSettings) return;

    try {
      setIsSaving(true);

      await settingsApi.update({
        primary_phone: siteSettings.primaryPhone,
        whatsapp_number: siteSettings.whatsappNumber,
        email: siteSettings.email,
        address: siteSettings.address,
        working_hours: siteSettings.workingHours,
        features,
      });

      toast({
        title: 'Settings saved',
        description: 'All changes have been saved successfully.',
      });
    } catch {
      toast({
        title: 'Save failed',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage site configuration and feature toggles
          </p>
        </div>
        {canEditSettings && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gradient-accent text-accent-foreground"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {!canEditSettings && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You have read-only access to settings.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-accent" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Business contact details shown on website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Primary Phone</Label>
              <Input
                value={siteSettings.primaryPhone}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, primaryPhone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Secondary Phone</Label>
              <Input
                value={siteSettings.secondaryPhone}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, secondaryPhone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>WhatsApp Number</Label>
              <Input
                value={siteSettings.whatsappNumber}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                type="email"
                value={siteSettings.email}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, email: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Location & Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={siteSettings.address}
              onChange={(e) =>
                setSiteSettings({ ...siteSettings, address: e.target.value })
              }
            />

            <Input
              value={siteSettings.workingHours}
              onChange={(e) =>
                setSiteSettings({ ...siteSettings, workingHours: e.target.value })
              }
            />
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-accent" />
              Feature Toggles
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {Object.entries(features).map(([key, value]) => (
              <div key={key} className="flex justify-between p-4 border rounded">
                <span className="capitalize">{key}</span>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, [key]: checked })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
