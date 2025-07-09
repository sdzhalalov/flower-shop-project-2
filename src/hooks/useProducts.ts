import { useState } from "react";
import { Product, Category } from "@/types";

const useProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Красные розы 'Гранд При'",
      price: 150,
      image:
        "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400",
      category: "roses",
      description: "Элегантные красные розы высшего качества",
      inStock: true,
      featured: true,
    },
    {
      id: 2,
      name: "Белые тюльпаны",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400",
      category: "tulips",
      description: "Нежные белые тюльпаны из Голландии",
      inStock: true,
      featured: false,
    },
    {
      id: 3,
      name: "Букет 'Весенняя радость'",
      price: 350,
      image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400",
      category: "bouquets",
      description: "Яркий весенний букет из смешанных цветов",
      inStock: true,
      featured: true,
    },
    {
      id: 4,
      name: "Фикус Бенджамина",
      price: 800,
      image:
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
      category: "plants",
      description: "Комнатное растение для дома и офиса",
      inStock: true,
      featured: false,
    },
    {
      id: 5,
      name: "Розовые пионы",
      price: 200,
      image:
        "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400",
      category: "roses",
      description: "Роскошные розовые пионы",
      inStock: true,
      featured: false,
    },
    {
      id: 6,
      name: "Красные тюльпаны",
      price: 130,
      image:
        "https://images.unsplash.com/photo-1582794543349-76249617d2c2?w=400",
      category: "tulips",
      description: "Яркие красные тюльпаны",
      inStock: true,
      featured: false,
    },
    {
      id: 7,
      name: "Букет невесты",
      price: 450,
      image:
        "https://images.unsplash.com/photo-1573625544872-93d4cbdc97be?w=400",
      category: "bouquets",
      description: "Элегантный свадебный букет",
      inStock: true,
      featured: true,
    },
    {
      id: 8,
      name: "Монстера Деликатесная",
      price: 1200,
      image:
        "https://images.unsplash.com/photo-1569318388198-fab1f47bb0fa?w=400",
      category: "plants",
      description: "Тропическое растение с красивыми листьями",
      inStock: true,
      featured: false,
    },
  ]);

  const categories: Category[] = [
    { value: "all", label: "Все товары" },
    { value: "roses", label: "Розы" },
    { value: "tulips", label: "Тюльпаны" },
    { value: "bouquets", label: "Букеты" },
    { value: "plants", label: "Растения" },
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
