import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validations";
import { useRateLimit } from "@/hooks/useRateLimit";
import { supabase } from "@/integrations/supabase/client";


export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { checkRateLimit, isChecking } = useRateLimit();
  const { signInWithGoogle, signInWithEmail, user, loading } = useAuth();
  const navigate = useNavigate();

  const SITE_KEY = (import.meta as any).env?.VITE_TURNSTILE_SITEKEY || '0x4AAAAAABpqGDEenRovXaTv';

  useEffect(() => {
    (window as any)._tsToken = null;
    (window as any).onTsOk = (t: string) => {
      console.info("TS token received", t?.slice(0, 10) + "…");
      (window as any)._tsToken = t;
    };
    (window as any).onTsExpired = () => {
      console.warn("TS expired");
      (window as any)._tsToken = null;
    };
    (window as any).onTsError = () => {
      console.error("TS error");
      (window as any)._tsToken = null;
    };
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    try {
      const validatedData = loginSchema.parse({ email, password });
      setErrors({});
      return validatedData;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        if (err.path && err.path.length > 0) {
          newErrors[err.path[0]] = err.message;
        }
      });
      setErrors(newErrors);
      return null;
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.info("Login submit fired");

    // Turnstile gate BEFORE existing login logic
    const tsToken = (window as any)._tsToken;
    if (!tsToken) {
      console.warn("No TS token; resetting");
      (window as any).turnstile?.reset();
      toast.error('Verificação necessária.');
      return;
    }

    try {
      const res = await fetch("https://whqxpuyjxoiufzhvqneg.functions.supabase.co/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "cf-turnstile-response": tsToken })
      });
      const json = await res.json();
      console.info("verify-turnstile response", json);

      if (!json.success) {
        console.warn("Turnstile verification failed:", json);
        (window as any).turnstile?.reset();
        toast.error('Falha na verificação anti-bot. Tente novamente.');
        return;
      }
    } catch (err) {
      console.warn('Turnstile verify error:', err);
      (window as any).turnstile?.reset();
      toast.error('Falha na verificação anti-bot. Tente novamente.');
      return;
    }

    // Validação completa com Zod
    const validatedData = validateForm();
    if (!validatedData) {
      toast.error('Por favor, corrija os erros nos campos destacados');
      return;
    }

    // Verificar rate limiting para tentativas de login (per IP on server; email used for correlation)
    const identifierEmail = email.trim().toLowerCase();
    const rateLimitPassed = await checkRateLimit('login_attempt', identifierEmail);
    
    if (!rateLimitPassed) {
      (window as any).turnstile?.reset();
      return; // Mensagem já foi exibida pelo hook
    }

    setIsLoading(true);
    
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        console.error('Login error:', error);
      }
      // Success handling is done in useAuth hook with redirect
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
      (window as any).turnstile?.reset();
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google login error:', error);
      }
      // Success handling is done in useAuth hook with redirect
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Entrar</CardTitle>
              <CardDescription>
                Entre na sua conta para participar das rifas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com"
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                      }}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                      }}
                      required
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground">
                    Lembrar de mim
                  </Label>
                </div>
                <Link 
                  to="/esqueci-senha" 
                  className="text-sm text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

                {/* Turnstile widget */}
                <div
                  className="cf-turnstile"
                  data-sitekey={SITE_KEY}
                  data-callback="onTsOk"
                  data-expired-callback="onTsExpired"
                  data-error-callback="onTsError"
                />
                {/* Security information */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">🔐 Protegido por Verificação Anti-Bot + Rate Limiting</span>
                  </div>
                </div>


                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || isChecking}
                >
                  {isLoading || isChecking ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isLoading ? "Conectando..." : "Entrar com Google"}
              </Button>

              <Separator />

              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/cadastro" className="text-primary hover:underline font-medium">
                  Criar conta
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}