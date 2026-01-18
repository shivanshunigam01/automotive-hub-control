import { useEffect, useState } from 'react';
import { Save, FileText, Globe, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { contentPagesApi, type ContentPage, type SocialLinks } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ContentPagesPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('about-us');
  const { toast } = useToast();
  const { canEdit } = usePermissions();
  const canEditContent = canEdit('contentPages');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [pagesData, linksData] = await Promise.all([
        contentPagesApi.getAll(),
        contentPagesApi.getSocialLinks(),
      ]);
      setPages(pagesData);
      setSocialLinks(linksData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch content',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function updatePageContent(pageKey: string, field: 'contentEn' | 'contentHi', value: string) {
    setPages((prev) =>
      prev.map((p) => (p.key === pageKey ? { ...p, [field]: value } : p))
    );
  }

  async function handleSavePage(pageKey: string) {
    const page = pages.find((p) => p.key === pageKey);
    if (!page) return;

    setIsSaving(true);
    try {
      await contentPagesApi.update(page.id, {
        contentEn: page.contentEn,
        contentHi: page.contentHi,
      });
      toast({ title: 'Content saved successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save content',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSocialLinks() {
    setIsSaving(true);
    try {
      await contentPagesApi.updateSocialLinks(socialLinks);
      toast({ title: 'Social links saved successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save social links',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  const getPage = (key: string) => pages.find((p) => p.key === key);

  const renderPageEditor = (pageKey: string, title: string) => {
    const page = getPage(pageKey);
    if (!page) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(page.updatedAt).toLocaleString()}
            </p>
          </div>
          {canEditContent && (
            <Button
              onClick={() => handleSavePage(pageKey)}
              disabled={isSaving}
              className="gradient-accent text-accent-foreground"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                English Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={page.contentEn}
                onChange={(e) => updatePageContent(pageKey, 'contentEn', e.target.value)}
                placeholder="Enter content in English..."
                rows={12}
                disabled={!canEditContent}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                Hindi Content (हिंदी)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={page.contentHi}
                onChange={(e) => updatePageContent(pageKey, 'contentHi', e.target.value)}
                placeholder="हिंदी में सामग्री दर्ज करें..."
                rows={12}
                disabled={!canEditContent}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Pages</h1>
          <p className="text-muted-foreground">Manage static content pages</p>
        </div>
        <DataTableSkeleton columns={2} rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Pages</h1>
        <p className="text-muted-foreground">
          Manage website static content in English and Hindi
        </p>
      </div>

      {!canEditContent && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have read-only access to content pages. Contact an administrator to make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about-us" className="gap-2">
            <FileText className="h-4 w-4" />
            About Us
          </TabsTrigger>
          <TabsTrigger value="service-warranty" className="gap-2">
            <FileText className="h-4 w-4" />
            Service & Warranty
          </TabsTrigger>
          <TabsTrigger value="parts-lubricants" className="gap-2">
            <FileText className="h-4 w-4" />
            Parts & Lubricants
          </TabsTrigger>
          <TabsTrigger value="social-links" className="gap-2">
            <Globe className="h-4 w-4" />
            Social Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about-us" className="mt-6">
          {renderPageEditor('about-us', 'About Us')}
        </TabsContent>

        <TabsContent value="service-warranty" className="mt-6">
          {renderPageEditor('service-warranty', 'Service & Warranty')}
        </TabsContent>

        <TabsContent value="parts-lubricants" className="mt-6">
          {renderPageEditor('parts-lubricants', 'Parts & Lubricants')}
        </TabsContent>

        <TabsContent value="social-links" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Manage your social media profile URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={socialLinks.facebook}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, facebook: e.target.value })
                    }
                    placeholder="https://facebook.com/yourpage"
                    disabled={!canEditContent}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={socialLinks.instagram}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, instagram: e.target.value })
                    }
                    placeholder="https://instagram.com/yourpage"
                    disabled={!canEditContent}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={socialLinks.youtube}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, youtube: e.target.value })
                    }
                    placeholder="https://youtube.com/yourchannel"
                    disabled={!canEditContent}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={socialLinks.linkedin}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, linkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/company/yourcompany"
                    disabled={!canEditContent}
                  />
                </div>
              </div>

              {canEditContent && (
                <>
                  <Separator />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveSocialLinks}
                      disabled={isSaving}
                      className="gradient-accent text-accent-foreground"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Social Links
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}