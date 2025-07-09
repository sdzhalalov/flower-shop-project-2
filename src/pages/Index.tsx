import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Icon from "@/components/ui/icon";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: Date;
  role: "guest" | "admin" | "moderator";
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentUser] = useState({ name: "Гость", role: "guest" as const });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      user: "Администратор",
      message: "Добро пожаловать в наш цветочный магазин! Чем могу помочь?",
      timestamp: new Date(),
      role: "admin",
    },
    {
      id: 2,
      user: "Модератор",
      message: "Сегодня скидка 15% на все букеты!",
      timestamp: new Date(),
      role: "moderator",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const products: Product[] = [
    {
      id: 1,
      name: "Букет роз «Романтика»",
      price: 3500,
      image: "/img/b3442a81-3a91-4e32-b748-8adda98e9986.jpg",
      category: "bouquets",
      description: "Нежный букет из розовых роз с эвкалиптом",
    },
    {
      id: 2,
      name: "Композиция «Весна»",
      price: 2800,
      image: "/img/e322782b-518a-4efa-aabf-714b8055cb34.jpg",
      category: "compositions",
      description: "Яркая весенняя композиция с тюльпанами",
    },
    {
      id: 3,
      name: "Свадебный букет",
      price: 5200,
      image: "/img/2db0604d-e9e2-446a-a2f3-5b7a64c89ee6.jpg",
      category: "wedding",
      description: "Элегантный свадебный букет из белых лилий",
    },
    {
      id: 4,
      name: "Букет хризантем",
      price: 2100,
      image: "/img/b3442a81-3a91-4e32-b748-8adda98e9986.jpg",
      category: "bouquets",
      description: "Осенний букет из хризантем различных оттенков",
    },
    {
      id: 5,
      name: "Композиция в коробке",
      price: 4200,
      image: "/img/e322782b-518a-4efa-aabf-714b8055cb34.jpg",
      category: "compositions",
      description: "Стильная композиция в дизайнерской коробке",
    },
    {
      id: 6,
      name: "Букет подсолнухов",
      price: 1800,
      image: "/img/2db0604d-e9e2-446a-a2f3-5b7a64c89ee6.jpg",
      category: "bouquets",
      description: "Солнечный букет из ярких подсолнухов",
    },
  ];

  const categories = [
    { value: "all", label: "Все товары" },
    { value: "bouquets", label: "Букеты" },
    { value: "compositions", label: "Композиции" },
    { value: "wedding", label: "Свадебные" },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: chatMessages.length + 1,
        user: currentUser.name,
        message: newMessage,
        timestamp: new Date(),
        role: currentUser.role,
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage("");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "moderator":
        return "bg-blue-100 text-blue-700";
      case "guest":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Icon name="Flower" className="h-8 w-8 text-pink-500" />
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Флора
              </h1>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a
                href="#"
                className="text-gray-700 hover:text-pink-500 transition-colors"
              >
                Главная
              </a>
              <a
                href="#catalog"
                className="text-gray-700 hover:text-pink-500 transition-colors"
              >
                Каталог
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-pink-500 transition-colors"
              >
                Контакты
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Chat Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Icon name="MessageCircle" className="h-4 w-4 mr-2" />
                    Чат
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Чат поддержки</DialogTitle>
                    <DialogDescription>
                      Онлайн консультация с нашими специалистами
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="h-64 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="flex items-start space-x-2"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {msg.user[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                {msg.user}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getRoleColor(msg.role)}`}
                              >
                                {msg.role === "admin"
                                  ? "Админ"
                                  : msg.role === "moderator"
                                    ? "Модератор"
                                    : "Гость"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Введите сообщение..."
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button onClick={sendMessage} size="sm">
                        <Icon name="Send" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Cart */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Icon name="ShoppingCart" className="h-4 w-4 mr-2" />
                    Корзина (
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Корзина</SheetTitle>
                    <SheetDescription>Ваши выбранные товары</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cartItems.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Корзина пуста
                      </p>
                    ) : (
                      <>
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-4 p-4 border rounded-lg"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500">
                                {item.price} ₽
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                <Icon name="Minus" className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Icon name="Plus" className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Итого:</span>
                          <span>{getTotalPrice().toLocaleString()} ₽</span>
                        </div>
                        <Button className="w-full" size="lg">
                          Оформить заказ
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2
                className="text-5xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Свежие цветы для
                <br />
                <span className="text-pink-500">особых моментов</span>
              </h2>
              <p
                className="text-xl text-gray-600"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                Создаем уникальные композиции и букеты для любого события.
                Доставка по всему городу в течение 2 часов.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-pink-500 hover:bg-pink-600">
                  <Icon name="ShoppingBag" className="h-5 w-5 mr-2" />
                  Посмотреть каталог
                </Button>
                <Button variant="outline" size="lg">
                  <Icon name="Phone" className="h-5 w-5 mr-2" />
                  Связаться с нами
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/img/b3442a81-3a91-4e32-b748-8adda98e9986.jpg"
                alt="Букет цветов"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Icon
                    name="Star"
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                  <span className="font-semibold">4.9</span>
                  <span className="text-gray-500">из 5</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Более 1000 отзывов</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Truck" className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-gray-600">
                Доставим ваш заказ в течение 2 часов по всему городу
              </p>
            </div>
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Flower2" className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Свежие цветы</h3>
              <p className="text-gray-600">
                Работаем только с проверенными поставщиками
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Heart" className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Индивидуальный подход
              </h3>
              <p className="text-gray-600">
                Создаем уникальные композиции по вашему желанию
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
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
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
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
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {product.price.toLocaleString()} ₽
                    </span>
                    <Button
                      onClick={() => addToCart(product)}
                      className="bg-pink-500 hover:bg-pink-600"
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

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2
                className="text-4xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Свяжитесь с нами
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Icon name="Phone" className="h-5 w-5 text-pink-500" />
                  <span>+7 (495) 123-45-67</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Mail" className="h-5 w-5 text-pink-500" />
                  <span>info@flora-shop.ru</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="MapPin" className="h-5 w-5 text-pink-500" />
                  <span>Москва, ул. Цветочная, 123</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Clock" className="h-5 w-5 text-pink-500" />
                  <span>Пн-Вс: 09:00 - 21:00</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Оставьте заявку</h3>
              <form className="space-y-4">
                <Input placeholder="Ваше имя" />
                <Input type="email" placeholder="Email" />
                <Input type="tel" placeholder="Телефон" />
                <Textarea placeholder="Сообщение" rows={4} />
                <Button className="w-full bg-pink-500 hover:bg-pink-600">
                  Отправить заявку
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Flower" className="h-6 w-6 text-pink-500" />
                <span className="text-xl font-bold">Флора</span>
              </div>
              <p className="text-gray-400">Лучший цветочный магазин в городе</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Каталог</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Букеты
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Композиции
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Свадебные
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Услуги</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Доставка
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Оформление
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Консультации
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+7 (495) 123-45-67</li>
                <li>info@flora-shop.ru</li>
                <li>Москва, ул. Цветочная, 123</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Флора. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
