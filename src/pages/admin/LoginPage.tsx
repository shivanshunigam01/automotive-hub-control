import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import punyaLogo from '@/assets/punya-logo.jpeg';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/admin');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 gradient-primary opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(47,125,246,0.24),transparent_28%)]" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <Card className="relative z-10 w-full max-w-md border-white/80 bg-white/95 shadow-[0_30px_80px_-40px_rgba(8,46,108,0.6)] backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <img
              src={punyaLogo}
              alt="Punya Autowheels"
              className="h-14 rounded-xl"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-[-0.03em] text-[#17325d]">
            Punya Admin Portal
          </CardTitle>
          <CardDescription>
            Sign in to access the Punya Autowheels control panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@patliputra.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-[#2f7df6] font-semibold text-white hover:bg-[#2567ca]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo Credentials:</strong><br />
              Email: admin@patliputra.com<br />
              Password: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
