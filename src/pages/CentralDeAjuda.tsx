import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  MapPin,
  HeadphonesIcon
} from "lucide-react";

export default function CentralDeAjuda() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Central de Ajuda
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Estamos aqui para ajudar você. Entre em contato conosco pelos canais abaixo.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-primary/20 transition-colors text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-500" />
                </div>
                <CardTitle>Telefone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Fale diretamente com nossa equipe
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="tel:021985588220">
                    021 985588220
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Envie sua dúvida por email
                </p>
                <Button variant="outline" className="w-full">
                  suporte@ganhavel.com
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors text-center md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-purple-500" />
                </div>
                <CardTitle>WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Chat direto no WhatsApp
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://wa.me/447747922946" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Support Hours */}
          <div className="max-w-2xl mx-auto mt-16">
            <Card className="border-2 border-orange-500/20 bg-orange-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 text-center justify-center">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Horário de Atendimento</h3>
                    <p className="text-muted-foreground">
                      Segunda a Sexta: 9h às 17h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}