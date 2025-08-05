import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Watch, 
  Gamepad2,
  Zap,
  DollarSign, 
  Car,
  TrendingUp,
  Home,
  ArrowLeft
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { CategoriasSEO } from "@/components/SEOPages";

import { getAllCategoriesData } from "@/data/categoriesData";

const categoriesData = getAllCategoriesData();

export default function Categorias() {
  const { categoria } = useParams();
  const categoryData = categoria ? categoriesData[categoria as keyof typeof categoriesData] : null;

  if (categoria && !categoryData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
            <Link to="/categorias">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Categorias
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (categoryData) {
    const Icon = categoryData.icon;
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to="/categorias">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Categorias
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                <Icon className={`w-8 h-8 ${categoryData.color}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{categoryData.name}</h1>
                <p className="text-muted-foreground">{categoryData.count} rifas disponíveis</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryData.subcategories.map((subcategory, index) => (
              <Card key={subcategory.name} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{subcategory.name}</CardTitle>
                    <Badge variant="secondary">{subcategory.count} rifas</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">Exemplos populares:</p>
                    {subcategory.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link to={`/categorias/${categoria}/${subcategory.slug}`}>
                    <Button className="w-full mt-4" variant="outline">
                      Ver todas as rifas de {subcategory.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CategoriasSEO />
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Todas as Categorias</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore todas as categorias de rifas disponíveis e encontre exatamente o que você está procurando
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categoriesData).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <Link key={key} to={`/categorias/${key}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.count} rifas</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Subcategorias:</p>
                      {category.subcategories.slice(0, 3).map((sub, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm">{sub.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {sub.count}
                          </Badge>
                        </div>
                      ))}
                      {category.subcategories.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{category.subcategories.length - 3} mais subcategorias
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
