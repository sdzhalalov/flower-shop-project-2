import { useState } from "react";
import { Product, Category } from "@/types";

const useProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Букет роз «Романтика»",
      price: 3500,
      oldPrice: 4000,
      image: "/img/b3442a81-3a91-4e32-b748-8adda98e9986.jpg",
      category: "bouquets",
      description: "Нежный букет из розовых роз с эвкалиптом",
      inStock: true,
      featured: true,
    },
    {
      id: 2,
      name: "Композиция «Весна»",
      price: 2800,
      image: "/img/e322782b-518a-4efa-aabf-714b8055cb34.jpg",
      category: "compositions",
      description: "Яркая весенняя композиция с тюльпанами",
      inStock: true,
      featured: false,
    },
    {
      id: 3,
      name: "Свадебный букет",
      price: 5200,
      oldPrice: 6000,
      image: "/img/2db0604d-e9e2-446a-a2f3-5b7a64c89ee6.jpg",
      category: "wedding",
      description: "Элегантный свадебный букет из белых лилий",
      inStock: true,
      featured: true,
    },
    {
      id: 4,
      name: "Букет хризантем",
      price: 2100,
      image: "/img/b3442a81-3a91-4e32-b748-8adda98e9986.jpg",
      category: "bouquets",
      description: "Осенний букет из хризантем различных оттенков",
      inStock: false,
      featured: false,
    },
    {
      id: 5,
      name: "Композиция в коробке",
      price: 4200,
      image: "/img/e322782b-518a-4efa-aabf-714b8055cb34.jpg",
      category: "compositions",
      description: "Стильная композиция в дизайнерской коробке",
      inStock: true,
      featured: false,
    },
    {
      id: 6,
      name: "Букет подсолнухов",
      price: 1800,
      oldPrice: 2200,
      image: "/img/2db0604d-e9e2-446a-a2f3-5b7a64c89ee6.jpg",
      category: "bouquets",
      description: "Солнечный букет из ярких подсолнухов",
      inStock: true,
      featured: true,
    },
  ]);

  const categories: Category[] = [
    { value: "all", label: "Все товары" },
    { value: "bouquets", label: "Букеты" },
    { value: "compositions", label: "Композиции" },
    { value: "wedding", label: "Свадебные" },
  ];

  const saveProduct = (
    product: Omit<Product, "id">,
    editingProduct?: Product | null,
  ) => {
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? { ...product, id: editingProduct.id }
            : p,
        ),
      );
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return {
    products,
    setProducts,
    selectedCategory,
    setSelectedCategory,
    categories,
    saveProduct,
    deleteProduct,
  };
};

export default useProducts;
