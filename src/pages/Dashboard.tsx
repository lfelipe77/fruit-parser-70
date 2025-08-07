import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Perfil do Usuário
                </CardTitle>
                <CardDescription>
                  Informações da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.user_metadata?.full_name || 'Usuário'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {user.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minhas Rifas</CardTitle>
                <CardDescription>
                  Rifas que você está participando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">
                  Nenhuma rifa ativa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prêmios Ganhos</CardTitle>
                <CardDescription>
                  Total de prêmios conquistados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">
                  Nenhum prêmio ganho ainda
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo ao Ganhavel!</CardTitle>
                <CardDescription>
                  Sua jornada para ganhar prêmios incríveis começa aqui
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explore os ganhaveis disponíveis e comece a participar para ter a chance de ganhar 
                  carros, motos, dinheiro e muito mais!
                </p>
                <div className="mt-4">
                  <Button asChild>
                    <a href="/descobrir">Explorar Rifas</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}