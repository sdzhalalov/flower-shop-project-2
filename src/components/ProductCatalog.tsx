import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <section
      id="catalog"
      className="py-16 bg-gradient-to-b from-white to-pink-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
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
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  variant={
                    selectedCategory === category.value ? "default" : "outline"
                  }
                  onClick={() => onCategoryChange(category.value)}
                  className={`${
                    selectedCategory === category.value
                      ? "bg-pink-600 hover:bg-pink-700"
                      : "hover:bg-pink-50 hover:border-pink-300"
                  }`}
                >
                  {category.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden h-full flex flex-col group cursor-pointer">
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon
                          name="Heart"
                          className="h-6 w-6 text-white hover:text-pink-500"
                        />
                      </motion.button>
                    </div>
                    {product.featured && (
                      <Badge className="absolute top-2 left-2 bg-pink-600 text-white">
                        Хит
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {product.description}
                    </CardDescription>

                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="Star"
                          className={`w-4 h-4 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">(4.8)</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-pink-600">
                          {product.price.toLocaleString()} ₽
                        </span>
                        {product.oldPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {product.oldPrice.toLocaleString()} ₽
                          </span>
                        )}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => onAddToCart(product)}
                          size="sm"
                          className="bg-pink-600 hover:bg-pink-700"
                          disabled={!product.inStock}
                        >
                          <Icon name="Plus" className="h-4 w-4 mr-1" />В корзину
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductCatalog;
