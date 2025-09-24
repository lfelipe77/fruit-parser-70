import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart, Star, Play, Users } from 'lucide-react';

const ImpactSection = () => {
  const stories = [
    {
      category: "🐶 Adoções Milionárias",
      items: [
        {
          title: "Doriana",
          subtitle: "A cadela que traz calma, alegria e futuro brilhante",
          url: "https://ganhavel.com/ganhavel/doriana-a-cadela-que-traz-calma-alegria-e-futuro-brilhante",
          image: "🐕",
          description: "História emocionante de uma cadela que mudou vidas",
          engagement: "15.2k visualizações"
        },
        {
          title: "Sushi",
          subtitle: "O gato zen que pode mudar destinos", 
          url: "https://ganhavel.com/ganhavel/sushi-o-gato-zen-que-pode-mudar-destinos",
          image: "🐱",
          description: "A jornada zen de um gato especial",
          engagement: "12.8k visualizações"
        }
      ]
    },
    {
      category: "👗🎮 Projetos com Influenciadores",
      items: [
        {
          title: "Collab Moda Sustentável",
          subtitle: "Com Camila Coutinho - Viagem Internacional",
          url: "https://ganhavel.com/ganhavel/collab-moda-sustentavel-camila-coutinho-viagem-internacional-1-milhao",
          image: "👗",
          description: "Parceria exclusiva focada em sustentabilidade",
          engagement: "28.5k visualizações"
        },
        {
          title: "Live Especial Gaming",
          subtitle: "Com Davi Geek Games - Streaming",
          url: "https://ganhavel.com/ganhavel/live-especial-davi-geek-games-streaming-1-milhao",
          image: "🎮",
          description: "Evento gaming ao vivo com grande engajamento",
          engagement: "45.7k visualizações"
        }
      ]
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-900/5 dark:to-purple-900/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Impacto & Inspiração</h2>
          <p className="text-xl text-muted-foreground">
            Muito além de vendas — histórias que engajam, conectam e transformam
          </p>
        </div>

        <div className="space-y-12">
          {stories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-2xl font-bold mb-8 text-foreground flex items-center">
                <span className="mr-3">{category.category}</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {category.items.map((story, storyIndex) => (
                  <Card key={storyIndex} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                    <CardContent className="p-0">
                      {/* Story Header */}
                      <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-8 text-white">
                        <div className="text-6xl mb-4 opacity-20 absolute top-4 right-4">
                          {story.image}
                        </div>
                        <div className="relative z-10">
                          <h4 className="text-xl font-bold mb-2">{story.title}</h4>
                          <p className="text-purple-100 text-sm mb-4">{story.subtitle}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{story.engagement}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-300" />
                              <span>Alto engajamento</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Story Content */}
                      <div className="p-6">
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {story.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(story.url, '_blank')}
                            className="group-hover:bg-purple-50 group-hover:border-purple-200 dark:group-hover:bg-purple-900/20"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver História
                          </Button>
                          
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span>Conteúdo viral</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ImpactSection;