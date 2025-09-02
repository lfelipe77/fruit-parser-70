import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ProfileErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  title?: string;
  description?: string;
}

export default function ProfileErrorState({ 
  error, 
  onRetry, 
  title = "Erro ao carregar perfil",
  description = "Não foi possível carregar as informações do perfil. Tente novamente."
}: ProfileErrorStateProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {error && (
          <details className="mt-2 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Detalhes do erro
            </summary>
            <pre className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={onRetry} variant="outline" className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </CardContent>
    </Card>
  );
}