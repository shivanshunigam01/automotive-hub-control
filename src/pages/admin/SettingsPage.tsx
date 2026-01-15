import { useState } from 'react';
import { Save, Phone, Mail, MapPin, Clock, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface SiteSettings {
  contactNumbers: string[];
  whatsappNumber: string;
  email: string;
  address: string;
  workingHours: string;
}

interface FeatureToggles {
  emiCalculator: boolean;
  usedVehicles: boolean;
  cibilCheck: boolean;
  comparison: boolean;
}

export function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    contactNumbers: ['+91 9876543210', '+91 9876543211'],
    whatsappNumber: '+91 9876543210',
    email: 'info@patliputra-motors.com',
    address: '123 Main Road, Patna, Bihar 800001',
    workingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
  });

  const [features, setFeatures] = useState<FeatureToggles>({
    emiCalculator: true,
    usedVehicles: true,
    cibilCheck: true,
    comparison: true,
  });

  async function handleSave() {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: 'Settings saved',
      description: 'Your changes have been saved successfully.',
    });
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
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gradient-accent text-accent-foreground"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-accent" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Update business contact details shown on the website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone1">Primary Phone</Label>
              <Input
                id="phone1"
                value={siteSettings.contactNumbers[0]}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    contactNumbers: [e.target.value, siteSettings.contactNumbers[1]],
                  })
                }
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone2">Secondary Phone</Label>
              <Input
                id="phone2"
                value={siteSettings.contactNumbers[1]}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    contactNumbers: [siteSettings.contactNumbers[0], e.target.value],
                  })
                }
                placeholder="+91 9876543211"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={siteSettings.whatsappNumber}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })
                }
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={siteSettings.email}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, email: e.target.value })
                }
                placeholder="info@patliputra-motors.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Location & Hours
            </CardTitle>
            <CardDescription>
              Business address and working hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={siteSettings.address}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, address: e.target.value })
                }
                placeholder="Enter full business address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Working Hours
              </Label>
              <Input
                id="hours"
                value={siteSettings.workingHours}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, workingHours: e.target.value })
                }
                placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-accent" />
              Feature Toggles
            </CardTitle>
            <CardDescription>
              Enable or disable features on the customer-facing website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h4 className="font-medium">EMI Calculator</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to calculate EMI for products
                  </p>
                </div>
                <Switch
                  checked={features.emiCalculator}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, emiCalculator: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h4 className="font-medium">Used Vehicles Section</h4>
                  <p className="text-sm text-muted-foreground">
                    Show used vehicles inventory on website
                  </p>
                </div>
                <Switch
                  checked={features.usedVehicles}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, usedVehicles: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h4 className="font-medium">CIBIL Score Check</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable CIBIL score checking feature
                  </p>
                </div>
                <Switch
                  checked={features.cibilCheck}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, cibilCheck: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h4 className="font-medium">Product Comparison</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to compare products
                  </p>
                </div>
                <Switch
                  checked={features.comparison}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, comparison: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
