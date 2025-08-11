import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { signUpSchema, type SignUpFormData } from "@/lib/validations";
import { useRateLimit } from "@/hooks/useRateLimit";
import { supabase } from "@/integrations/supabase/client";
import { runTurnstileDiagnostics } from "@/lib/turnstileDebug";

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

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const pendingResolveRef = useRef<((t: string) => void) | null>(null);

  const ensureWidget = async () => {
    const el = document.getElementById('turnstile-signup');
    if (!el) throw new Error('Elemento Turnstile não encontrado');
    const renderNow = () => {
      if (!widgetIdRef.current) {
        const id = (window as any).turnstile.render(el, {
          sitekey: siteKey,
          size: 'invisible',
          action: 'signup',
          callback: (token: string) => {
            tokenRef.current = token;
            if (pendingResolveRef.current) {
              pendingResolveRef.current(token);
              pendingResolveRef.current = null;
            }
          },
          'error-callback': () => {
            pendingResolveRef.current = null;
          },
          'expired-callback': () => {
            tokenRef.current = null;
          },
        });
        widgetIdRef.current = id;
      }
    };
    if ((window as any).turnstile) {
      renderNow();
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const start = Date.now();
      const int = setInterval(() => {
        if ((window as any).turnstile) {
          clearInterval(int);
          renderNow();
          resolve();
        } else if (Date.now() - start > 5000) {
          clearInterval(int);
          reject(new Error('Turnstile não carregado'));
        }
      }, 100);
    });
  };

  const getTurnstileToken = async () => {
    await ensureWidget();
    return new Promise<string>((resolve, reject) => {
      if (!widgetIdRef.current) return reject(new Error('Widget ausente'));
      pendingResolveRef.current = resolve;
      try {
        (window as any).turnstile.execute(widgetIdRef.current);
      } catch {
        reject(new Error('Falha ao executar Turnstile'));
      }
      setTimeout(() => {
        if (tokenRef.current) resolve(tokenRef.current);
        else reject(new Error('Timeout ao obter token'));
      }, 8000);
    });
  };

  useEffect(() => {
    runTurnstileDiagnostics('#turnstile-signup', 'signup');
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
    
    if (!acceptedTerms) {
      toast.error('Você deve aceitar os termos para continuar');
      return;
    }

    // Validação completa com Zod
    const validatedData = validateForm();
    if (!validatedData) {
      toast.error('Por favor, corrija os erros nos campos destacados');
      return;
    }

    try {
      const token = await getTurnstileToken();
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token, action: 'signup' },
      });
      if (verifyError || !verifyData?.success) {
        toast.error('Falha na verificação anti-bot. Tente novamente.');
        return;
      }
    } catch {
      toast.error('Falha na verificação anti-bot. Tente novamente.');
      return;
    }


    // Verificar rate limiting (per IP on server; email used for correlation)
    const identifierEmail = (formData.email || '').trim().toLowerCase();
    const rateLimitPassed = await checkRateLimit('signup_attempt', identifierEmail);
    
    if (!rateLimitPassed) {
      return; // Mensagem já foi exibida pelo hook
    }

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password);
      if (!error) {
        toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
        // Optionally redirect to login page after successful signup
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      toast.error('Erro no cadastro');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
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
                    {/* Turnstile (invisible) container */}
                    <div
                      id="turnstile-signup"
                      className="hidden"
                      data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                      data-size="invisible"
                      data-action="signup"
                    />

                    {/* Security information */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                        <Lock className="w-4 h-4" />
                        <span className="font-medium">🔐 Protegido por Senha Forte + Verificação de E-mail</span>
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