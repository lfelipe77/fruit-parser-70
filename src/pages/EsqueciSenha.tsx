import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, digite seu email');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });

      if (error) {
        toast.error('Erro ao enviar email de recuperação: ' + error.message);
      } else {
        setIsEmailSent(true);
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Email Enviado!</CardTitle>
                <CardDescription>
                  Verifique sua caixa de entrada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground mb-6">
                    Enviamos um link de recuperação para <strong>{email}</strong>. 
                    Clique no link para redefinir sua senha.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEmailSent(false)}
                    className="w-full"
                  >
                    Tentar Novamente
                  </Button>
                </div>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar para Login
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
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
              <CardTitle className="text-2xl">Esqueci a Senha</CardTitle>
              <CardDescription>
                Digite seu email para receber um link de recuperação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
                </Button>
              </form>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar para Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}