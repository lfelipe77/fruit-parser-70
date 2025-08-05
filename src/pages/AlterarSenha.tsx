import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

export default function AlterarSenha() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Senha atual é obrigatória";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Nova senha deve ter pelo menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = "Nova senha deve conter ao menos: 1 letra maiúscula, 1 minúscula e 1 número";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação da senha é obrigatória";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "A nova senha deve ser diferente da atual";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // TODO: Implement password change with Supabase
    toast({
      title: "Sucesso!",
      description: "Sua senha foi alterada com sucesso.",
    });
    
    navigate("/minha-conta");
  };

  const passwordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    return {
      score,
      text: score < 2 ? "Fraca" : score < 4 ? "Média" : "Forte",
      color: score < 2 ? "text-red-500" : score < 4 ? "text-yellow-500" : "text-green-500"
    };
  };

  const strength = passwordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/minha-conta")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Minha Conta
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Alterar Senha</h1>
          </div>
          <p className="text-muted-foreground">
            Mantenha sua conta segura alterando sua senha regularmente
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Definir Nova Senha</CardTitle>
            <CardDescription>
              Digite sua senha atual e escolha uma nova senha segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    className="pl-10 pr-10"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    className="pl-10 pr-10"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {formData.newPassword && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm">Força da senha:</div>
                    <div className={`text-sm font-medium ${strength.color}`}>
                      {strength.text}
                    </div>
                  </div>
                )}
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    className="pl-10 pr-10"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  />
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
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">As senhas coincidem</span>
                  </div>
                )}
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Security Tips */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dicas de segurança:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Use pelo menos 8 caracteres</li>
                    <li>• Inclua letras maiúsculas e minúsculas</li>
                    <li>• Adicione números e símbolos</li>
                    <li>• Evite informações pessoais óbvias</li>
                    <li>• Não reutilize senhas de outras contas</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/minha-conta")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                >
                  Alterar Senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Precisa de ajuda?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Se você esqueceu sua senha atual, use a opção "Esqueci minha senha" na tela de login.
              </p>
              <Link to="/login" className="text-primary hover:underline text-sm">
                Ir para tela de login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}