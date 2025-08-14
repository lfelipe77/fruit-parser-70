import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { signUpSchema, type SignUpFormData } from "@/lib/validations";
import { useRateLimit } from "@/hooks/useRateLimit";
import { supabase } from "@/integrations/supabase/client";
import { safeFetch } from "@/lib/net";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { checkRateLimit, isChecking } = useRateLimit();
  
  const { user, signInWithGoogle, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[TS] BYPASS:', import.meta.env.VITE_ADMIN_TURNSTILE_BYPASS);
    
    // Check if Turnstile should be bypassed
    if (import.meta.env.VITE_ADMIN_TURNSTILE_BYPASS === 'true') {
      return; // Skip Turnstile initialization
    }

    const sitekey = import.meta.env.VITE_TURNSTILE_SITEKEY || "0x4AAAAAABpqGDEenRovXaTv";
    (window as any)._tsToken = null;
    (window as any)._tsWidgetId = null;

    const render = () => {
      const turn = (window as any).turnstile;
      if (!turn) {
        console.log("Turnstile not yet loaded");
        return false;
      }
      if (!document.querySelector("#ts-widget")) {
        console.log("Turnstile container not found");
        return false;
      }

      console.log("Rendering Turnstile widget with sitekey:", sitekey);
      const id = turn.render("#ts-widget", {
        sitekey,
        callback: (t: string) => { 
          (window as any)._tsToken = t; 
          console.info('TS token received', t?.slice(0, 10) + '…'); 
        },
        "expired-callback": () => { 
          (window as any)._tsToken = null; 
          console.warn('Turnstile token expired');
        },
        "error-callback": () => { 
          (window as any)._tsToken = null; 
          console.error('Turnstile error callback triggered');
        },
      });
      (window as any)._tsWidgetId = id;
      console.log("Turnstile widget rendered with ID:", id);
      return true;
    };

    // wait for script + container quietly (no console warnings)
    const start = Date.now();
    const tick = () => {
      if (render()) return;
      if (Date.now() - start < 4000) requestAnimationFrame(tick);
      else console.warn("Turnstile widget failed to render within 4 seconds");
    };

    console.log("Initializing Turnstile...");
    if ((window as any).turnstile) {
      console.log("Turnstile already loaded, rendering immediately");
      tick();
    } else {
      const s = document.querySelector('script[src*="turnstile/v0/api.js"]') as HTMLScriptElement | null;
      const onLoad = () => {
        console.log("Turnstile script loaded");
        tick();
      };
      if (s) {
        console.log("Turnstile script found, adding load listener");
        s.addEventListener("load", onLoad, { once: true });
      } else {
        console.log("Loading Turnstile script");
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", onLoad, { once: true });
        document.head.appendChild(script);
      }
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Auto-fill form when user logs in with Google
  useEffect(() => {
    if (user && user.user_metadata) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata.full_name || user.user_metadata.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpar erro do campo quando o usuário digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleGoogleSignUp = async () => {
    console.log("Google signup initiated");
    
    // Skip Turnstile verification if bypassed
    if (import.meta.env.VITE_ADMIN_TURNSTILE_BYPASS !== 'true') {
      console.log('[TS] Checking Turnstile token for Google signup...');
      const token = (window as any)._tsToken;
      if (!token) {
        try { (window as any).turnstile?.reset((window as any)._tsWidgetId ?? undefined); } catch {}
        toast.error("Verificação necessária.");
        return;
      }
      const res = await safeFetch(
        "https://whqxpuyjxoiufzhvqneg.functions.supabase.co/verify-turnstile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "cf-turnstile-response": token })
        },
        8000,
        'turnstile-verify-google'
      );
      const json = await res.json();
      if (!json.success) {
        try { (window as any).turnstile?.reset((window as any)._tsWidgetId ?? undefined); } catch {}
        toast.error("Falha na verificação anti-bot. Tente novamente.");
        return;
      }
    } else {
      console.log('[TS] Turnstile bypassed for Google signup');
    }
    
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        const errorMessage = typeof error === 'string' ? error : error.message;
        toast.error('Erro no cadastro com Google: ' + errorMessage);
      }
    } catch (error) {
      toast.error('Erro no cadastro com Google');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    try {
      const validatedData = signUpSchema.parse(formData);
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

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const startTime = Date.now();
    const startTimestamp = new Date(startTime).toISOString();
    console.log(`[${startTimestamp}] Email signup initiated with form data:`, formData);
    
    if (!acceptedTerms) {
      toast.error('Você deve aceitar os termos para continuar');
      return;
    }

    // Turnstile verification with enhanced timing and debugging
    if (import.meta.env.VITE_ADMIN_TURNSTILE_BYPASS !== 'true') {
      console.log('[TS] Checking Turnstile token for email signup...');
      const checkStartTime = Date.now();
      console.log(`[${new Date(checkStartTime).toISOString()}] Checking Turnstile token...`);
      
      const tsToken = (window as any)._tsToken;
      const widgetId = (window as any)._tsWidgetId;
      
      console.log(`[${new Date().toISOString()}] Turnstile debug info:`, {
        token: tsToken ? `${tsToken.slice(0, 10)}...` : "missing",
        tokenLength: tsToken ? tsToken.length : 0,
        widgetId: widgetId,
        turnstileLoaded: !!(window as any).turnstile,
        widgetElement: !!document.querySelector('#ts-widget'),
        timeSinceStart: Date.now() - startTime + 'ms'
      });
      
      if (!tsToken) {
        const errorTime = new Date().toISOString();
        console.error(`[${errorTime}] Turnstile token not found at, widget may not be loaded or verified`);
        console.error(`[${errorTime}] Total time elapsed:`, Date.now() - startTime, 'ms');
        
        try { 
          (window as any).turnstile?.reset(widgetId); 
          console.log(`[${new Date().toISOString()}] Turnstile widget reset`);
        } catch (resetErr) {
          console.error(`[${new Date().toISOString()}] Failed to reset Turnstile widget:`, resetErr);
        }
        toast.error('Verificação anti-bot necessária. Aguarde um momento e tente novamente.');
        return;
      }

      try {
        const fetchStartTime = Date.now();
        const fetchStartTimestamp = new Date(fetchStartTime).toISOString();
        console.log(`[${fetchStartTimestamp}] Sending Turnstile token to backend. Token: ${tsToken.slice(0, 10)}...`);
        console.log(`[${fetchStartTimestamp}] Request payload:`, { 
          "cf-turnstile-response": `${tsToken.slice(0, 10)}...(${tsToken.length} chars total)` 
        });
        
        let res;
        for (let attempt = 1; attempt <= 3; attempt++) {
          console.log(`[${new Date().toISOString()}] Verification attempt ${attempt}/3`);
          
          res = await safeFetch(
            "https://whqxpuyjxoiufzhvqneg.functions.supabase.co/verify-turnstile",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ "cf-turnstile-response": tsToken })
            },
            8000,
            `turnstile-verify-attempt-${attempt}`
          ).catch(fetchErr => {
            const errorTime = new Date().toISOString();
            console.error(`[${errorTime}] Fetch error on attempt ${attempt} after ${Date.now() - fetchStartTime}ms:`, fetchErr);
            throw new Error(`Network error: ${fetchErr.message}`);
          });

          const fetchEndTime = Date.now();
          const fetchDuration = fetchEndTime - fetchStartTime;
          console.log(`[${new Date(fetchEndTime).toISOString()}] Attempt ${attempt} fetch completed in ${fetchDuration}ms`);

          if (res.ok) {
            console.log(`[${new Date().toISOString()}] Verification successful on attempt ${attempt}`);
            break;
          } else if (res.status === 429) {
            const errorText = await res.text().catch(() => 'Unable to read response');
            console.warn(`[${new Date().toISOString()}] Rate limit hit on attempt ${attempt}. Status: ${res.status}, Text: ${errorText}`);
            
            if (attempt < 3) {
              console.warn(`[${new Date().toISOString()}] Waiting 2s before retry...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              console.error(`[${new Date().toISOString()}] All retry attempts exhausted, final status: ${res.status}`);
              throw new Error(`Rate limit exceeded after 3 attempts: ${errorText}`);
            }
          } else {
            console.error(`[${new Date().toISOString()}] HTTP error on attempt ${attempt}:`, res.status, res.statusText);
            console.error(`[${new Date().toISOString()}] Response headers:`, Object.fromEntries(res.headers.entries()));
            
            const errorText = await res.text().catch(() => 'Unable to read response');
            console.error(`[${new Date().toISOString()}] Response body:`, errorText);
            console.error(`[${new Date().toISOString()}] Total verification time:`, Date.now() - fetchStartTime, 'ms');
            
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }
        }

        const json = await res.json().catch(jsonErr => {
          const errorTime = new Date().toISOString();
          console.error(`[${errorTime}] JSON parse error after ${Date.now() - fetchStartTime}ms:`, jsonErr);
          throw new Error('Invalid JSON response from server');
        });

        const successTime = new Date().toISOString();
        const totalDuration = Date.now() - fetchStartTime;
        console.log(`[${successTime}] Turnstile verified, proceeding with signup. Response:`, json);
        console.log(`[${successTime}] Verification completed in ${totalDuration}ms`);

        if (!json.success) {
          console.error(`[${new Date().toISOString()}] Turnstile verification failed:`, json);
          const errorCodes = json['error-codes'] || json.errorCodes || [];
          console.error(`[${new Date().toISOString()}] Error codes:`, errorCodes);
          console.error(`[${new Date().toISOString()}] Full response structure:`, Object.keys(json));
          
          try { 
            (window as any).turnstile?.reset(widgetId); 
            console.log(`[${new Date().toISOString()}] Turnstile widget reset after failed verification`);
          } catch (resetErr) {
            console.error(`[${new Date().toISOString()}] Failed to reset Turnstile widget:`, resetErr);
          }
          
          toast.error('Falha na verificação anti-bot. Tente novamente.');
          return;
        }
        console.log(`[${new Date().toISOString()}] Turnstile verification successful`);
      } catch (err) {
        const errorTime = new Date().toISOString();
        const errorDuration = Date.now() - startTime;
        console.error(`[${errorTime}] Turnstile verification error after ${errorDuration}ms:`, err);
        console.error(`[${errorTime}] Error details:`, {
          message: err.message,
          stack: err.stack,
          name: err.name,
          cause: err.cause
        });
        
        try { 
          (window as any).turnstile?.reset(widgetId); 
          console.log(`[${new Date().toISOString()}] Turnstile widget reset after error`);
        } catch (resetErr) {
          console.error(`[${new Date().toISOString()}] Failed to reset Turnstile widget:`, resetErr);
        }
        
        toast.error('Falha na verificação anti-bot. Tente novamente.');
        return;
      }
    } else {
      console.log('[TS] Turnstile bypassed for email signup');
      console.log(`[${new Date().toISOString()}] Turnstile bypassed for development`);
    }

    // Validação completa com Zod
    console.log("Validating form data...");
    const validatedData = validateForm();
    if (!validatedData) {
      console.log("Form validation failed, errors:", errors);
      toast.error('Por favor, corrija os erros nos campos destacados');
      return;
    }
    console.log("Form validation successful");

    // Verificar rate limiting (per IP on server; email used for correlation)
    const identifierEmail = (formData.email || '').trim().toLowerCase();
    console.log("Checking rate limit for:", identifierEmail);
    const rateLimitPassed = await checkRateLimit('signup_attempt', identifierEmail);
    
    if (!rateLimitPassed) {
      console.log("Rate limit check failed");
      try { (window as any).turnstile?.reset((window as any)._tsWidgetId ?? undefined); } catch {}
      return; // Mensagem já foi exibida pelo hook
    }
    console.log("Rate limit check passed");

    setLoading(true);
    try {
      console.log("Attempting signup with email:", formData.email);
      const { error } = await signUp(formData.email, formData.password);
      
      if (error) {
        console.error('Signup error from useAuth:', error);
        // Error handling is already done in useAuth hook
      } else {
        console.log('Signup successful');
        toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
        // Optionally redirect to login page after successful signup
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast.error('Erro inesperado no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
      try { (window as any).turnstile?.reset((window as any)._tsWidgetId ?? undefined); } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Criar Conta</CardTitle>
              <CardDescription>
                Junte-se à Ganhavel e comece a participar das melhores rifas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Sign Up - Top Priority */}
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
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
                  {loading ? 'Cadastrando...' : 'Cadastrar com Google'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou preencha os dados abaixo
                    </span>
                  </div>
                </div>
              </div>

              {/* Manual Form - Auto-filled when Google login is used */}
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo {user && <span className="text-xs text-green-600">(preenchido automaticamente)</span>}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="Digite seu nome completo"
                      className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email {user && <span className="text-xs text-green-600">(preenchido automaticamente)</span>}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com"
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      placeholder="(11) 99999-9999"
                      className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf" 
                    placeholder="000.000.000-00"
                    className={errors.cpf ? "border-destructive" : ""}
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                  />
                  {errors.cpf && (
                    <p className="text-sm text-destructive">{errors.cpf}</p>
                  )}
                </div>

                {!user && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="confirmPassword" 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label 
                    htmlFor="terms" 
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    Aceito os Termos na página{" "}
                    <Link to="/como-funciona" className="text-primary hover:underline">
                      Como funciona
                    </Link>{" "}
                    e{" "}
                    <Link to="/confianca-seguranca" className="text-primary hover:underline">
                      confiança e segurança
                    </Link>
                  </Label>
                </div>

                {!user && (
                  <>
                    {/* Turnstile widget (explicit render container) */}
                    {import.meta.env.VITE_ADMIN_TURNSTILE_BYPASS !== 'true' && (
                      <div id="ts-widget" />
                    )}
                    
                    {/* Security information */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">🔐 Protegido por Verificação Anti-Bot + Rate Limiting</span>
                      </div>
                    </div>

                    <Button 
                      variant="hero" 
                      className="w-full" 
                      size="lg" 
                      type="submit"
                      disabled={loading || isChecking}
                    >
                      {loading || isChecking ? 'Criando conta...' : 'Criar Conta'}
                    </Button>
                  </>
                )}
                
                {user && (
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      ✅ Conta criada com Google! Complete as informações adicionais se desejar.
                    </p>
                  </div>
                )}
              </form>

              <Separator />

              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Faça login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}