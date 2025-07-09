import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { Product, Category } from "@/types";

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
}) => {
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <section id="catalog" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Наш каталог
          </h2>
          <p
            className="text-xl text-gray-600"
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            Выберите идеальный букет для любого случая
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-64 mx-auto">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-white text-gray-800">
                  {product.category === "bouquets"
                    ? "Букеты"
                    : product.category === "compositions"
                      ? "Композиции"
                      : "Свадебные"}
                </Badge>
                {product.featured && (
                  <Badge className="absolute top-4 left-4 bg-pink-500 text-white">
                    Хит
                  </Badge>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {product.price.toLocaleString()} ₽
                      </span>
                      {product.oldPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          {product.oldPrice.toLocaleString()} ₽
                        </span>
                      )}
                    </div>
                    {!product.inStock && (
                      <Badge variant="destructive" className="mt-1">
                        Нет в наличии
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => onAddToCart(product)}
                    className="bg-pink-500 hover:bg-pink-600"
                    disabled={!product.inStock}
                  >
                    <Icon name="ShoppingCart" className="h-4 w-4 mr-2" />В
                    корзину
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCatalog;
