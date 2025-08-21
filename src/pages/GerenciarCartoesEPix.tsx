import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import SimpleTabs from "@/components/SimpleTabs";
import { CreditCard, Plus, Trash2, Edit, QrCode, Smartphone, ChevronLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CartaoSalvo {
  id: string;
  numero: string;
  nome: string;
  bandeira: string;
  principal: boolean;
}

interface ChavePix {
  id: string;
  tipo: "cpf" | "email" | "telefone" | "aleatoria";
  valor: string;
  principal: boolean;
}

export default function GerenciarCartoesEPix() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cartoesSalvos, setCartoesSalvos] = useState<CartaoSalvo[]>([
    {
      id: "1",
      numero: "**** **** **** 1234",
      nome: "João Silva",
      bandeira: "Visa",
      principal: true
    },
    {
      id: "2", 
      numero: "**** **** **** 5678",
      nome: "João Silva",
      bandeira: "Mastercard",
      principal: false
    }
  ]);

  const [chavesPix, setChavesPix] = useState<ChavePix[]>([
    {
      id: "1",
      tipo: "email",
      valor: "joao@email.com",
      principal: true
    },
    {
      id: "2",
      tipo: "telefone", 
      valor: "(11) 99999-9999",
      principal: false
    }
  ]);

  const [novoCartao, setNovoCartao] = useState({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
    bandeira: ""
  });

  const [novaChavePix, setNovaChavePix] = useState({
    tipo: "",
    valor: ""
  });

  const [dialogCartaoAberto, setDialogCartaoAberto] = useState(false);
  const [dialogPixAberto, setDialogPixAberto] = useState(false);

  const handleAdicionarCartao = () => {
    if (!novoCartao.numero || !novoCartao.nome || !novoCartao.validade || !novoCartao.cvv) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const cartao: CartaoSalvo = {
      id: Date.now().toString(),
      numero: `**** **** **** ${novoCartao.numero.slice(-4)}`,
      nome: novoCartao.nome,
      bandeira: novoCartao.bandeira || "Visa",
      principal: cartoesSalvos.length === 0
    };

    setCartoesSalvos([...cartoesSalvos, cartao]);
    setNovoCartao({ numero: "", nome: "", validade: "", cvv: "", bandeira: "" });
    setDialogCartaoAberto(false);
    
    toast({
      title: "Cartão adicionado",
      description: "Seu cartão foi salvo com sucesso!"
    });
  };

  const handleAdicionarPix = () => {
    if (!novaChavePix.tipo || !novaChavePix.valor) {
      toast({
        title: "Erro", 
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const chave: ChavePix = {
      id: Date.now().toString(),
      tipo: novaChavePix.tipo as any,
      valor: novaChavePix.valor,
      principal: chavesPix.length === 0
    };

    setChavesPix([...chavesPix, chave]);
    setNovaChavePix({ tipo: "", valor: "" });
    setDialogPixAberto(false);
    
    toast({
      title: "Chave PIX adicionada",
      description: "Sua chave PIX foi salva com sucesso!"
    });
  };

  const handleRemoverCartao = (id: string) => {
    setCartoesSalvos(cartoesSalvos.filter(c => c.id !== id));
    toast({
      title: "Cartão removido",
      description: "O cartão foi removido com sucesso"
    });
  };

  const handleRemoverPix = (id: string) => {
    setChavesPix(chavesPix.filter(c => c.id !== id));
    toast({
      title: "Chave PIX removida", 
      description: "A chave PIX foi removida com sucesso"
    });
  };

  const handleDefinirPrincipal = (id: string, tipo: "cartao" | "pix") => {
    if (tipo === "cartao") {
      setCartoesSalvos(cartoesSalvos.map(c => ({ ...c, principal: c.id === id })));
    } else {
      setChavesPix(chavesPix.map(c => ({ ...c, principal: c.id === id })));
    }
    
    toast({
      title: "Método principal atualizado",
      description: `${tipo === "cartao" ? "Cartão" : "Chave PIX"} definido como principal`
    });
  };

  const formatarTipoPix = (tipo: string) => {
    switch (tipo) {
      case "cpf": return "CPF";
      case "email": return "E-mail";
      case "telefone": return "Telefone";
      case "aleatoria": return "Chave Aleatória";
      default: return tipo;
    }
  };

  const getBandeiraIcon = (bandeira: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const lastPath = sessionStorage.getItem("lastPath");
              const redirectTo = lastPath && lastPath !== "/gerenciar-cartoes-e-pix" ? lastPath : "/dashboard";
              navigate(redirectTo);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Cartões e PIX</h1>
            <p className="text-muted-foreground">
              Gerencie seus métodos de pagamento salvos
            </p>
          </div>
        </div>

        <Tabs defaultValue="cartoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cartoes" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cartões
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              PIX
            </TabsTrigger>
          </TabsList>

          {/* Cartões Tab */}
          <TabsContent value="cartoes" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Meus Cartões</CardTitle>
                  <CardDescription>
                    Gerencie seus cartões de crédito e débito salvos
                  </CardDescription>
                </div>
                <Dialog open={dialogCartaoAberto} onOpenChange={setDialogCartaoAberto}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Cartão
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                      <DialogDescription>
                        Adicione um novo cartão para pagamentos futuros
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número do Cartão</Label>
                        <Input
                          id="numero"
                          placeholder="1234 5678 9012 3456"
                          value={novoCartao.numero}
                          onChange={(e) => setNovoCartao({ ...novoCartao, numero: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome no Cartão</Label>
                        <Input
                          id="nome"
                          placeholder="João Silva"
                          value={novoCartao.nome}
                          onChange={(e) => setNovoCartao({ ...novoCartao, nome: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="validade">Validade</Label>
                          <Input
                            id="validade"
                            placeholder="MM/AA"
                            value={novoCartao.validade}
                            onChange={(e) => setNovoCartao({ ...novoCartao, validade: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={novoCartao.cvv}
                            onChange={(e) => setNovoCartao({ ...novoCartao, cvv: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bandeira">Bandeira</Label>
                        <Select value={novoCartao.bandeira} onValueChange={(value) => setNovoCartao({ ...novoCartao, bandeira: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a bandeira" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visa">Visa</SelectItem>
                            <SelectItem value="mastercard">Mastercard</SelectItem>
                            <SelectItem value="elo">Elo</SelectItem>
                            <SelectItem value="amex">American Express</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setDialogCartaoAberto(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAdicionarCartao}>
                        Adicionar Cartão
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {cartoesSalvos.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum cartão salvo</p>
                    <p className="text-sm text-muted-foreground">
                      Adicione um cartão para facilitar seus pagamentos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartoesSalvos.map((cartao) => (
                      <div key={cartao.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getBandeiraIcon(cartao.bandeira)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{cartao.numero}</span>
                              {cartao.principal && (
                                <Badge variant="default" className="text-xs">
                                  Principal
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {cartao.nome} • {cartao.bandeira}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!cartao.principal && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDefinirPrincipal(cartao.id, "cartao")}
                            >
                              Definir como Principal
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Cartão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover este cartão? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoverCartao(cartao.id)}>
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança dos Cartões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Seus dados estão seguros</p>
                    <p className="text-sm text-muted-foreground">
                      Utilizamos criptografia de ponta para proteger suas informações
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Não armazenamos dados completos do cartão</p>
                  <p>• Processamento seguro via parceiros certificados</p>
                  <p>• Conformidade com padrões PCI DSS</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PIX Tab */}
          <TabsContent value="pix" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Minhas Chaves PIX</CardTitle>
                  <CardDescription>
                    Gerencie suas chaves PIX para recebimentos
                  </CardDescription>
                </div>
                <Dialog open={dialogPixAberto} onOpenChange={setDialogPixAberto}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Chave PIX
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Chave PIX</DialogTitle>
                      <DialogDescription>
                        Adicione uma nova chave PIX para recebimentos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo-pix">Tipo de Chave</Label>
                        <Select value={novaChavePix.tipo} onValueChange={(value) => setNovaChavePix({ ...novaChavePix, tipo: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de chave" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cpf">CPF</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="telefone">Telefone</SelectItem>
                            <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="valor-pix">Valor da Chave</Label>
                        <Input
                          id="valor-pix"
                          placeholder={
                            novaChavePix.tipo === "cpf" ? "000.000.000-00" :
                            novaChavePix.tipo === "email" ? "seuemail@exemplo.com" :
                            novaChavePix.tipo === "telefone" ? "(11) 99999-9999" :
                            "Chave gerada automaticamente"
                          }
                          value={novaChavePix.valor}
                          onChange={(e) => setNovaChavePix({ ...novaChavePix, valor: e.target.value })}
                          disabled={novaChavePix.tipo === "aleatoria"}
                        />
                        {novaChavePix.tipo === "aleatoria" && (
                          <p className="text-xs text-muted-foreground">
                            A chave aleatória será gerada automaticamente pelo sistema
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setDialogPixAberto(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAdicionarPix}>
                        Adicionar Chave
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {chavesPix.length === 0 ? (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma chave PIX cadastrada</p>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma chave PIX para receber pagamentos instantâneos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chavesPix.map((chave) => (
                      <div key={chave.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {chave.tipo === "email" ? <QrCode className="h-5 w-5" /> :
                             chave.tipo === "telefone" ? <Smartphone className="h-5 w-5" /> :
                             <QrCode className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatarTipoPix(chave.tipo)}</span>
                              {chave.principal && (
                                <Badge variant="default" className="text-xs">
                                  Principal
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {chave.valor}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!chave.principal && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDefinirPrincipal(chave.id, "pix")}
                            >
                              Definir como Principal
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Chave PIX</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover esta chave PIX? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoverPix(chave.id)}>
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Sobre o PIX
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Pagamentos Instantâneos</h4>
                    <p className="text-sm text-muted-foreground">
                      Receba pagamentos em tempo real, 24h por dia
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Sem Taxas</h4>
                    <p className="text-sm text-muted-foreground">
                      Para pessoas físicas, o PIX é gratuito
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Funciona com qualquer banco ou instituição financeira</p>
                  <p>• Chaves fáceis de lembrar e compartilhar</p>
                  <p>• Máxima segurança do Banco Central</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}