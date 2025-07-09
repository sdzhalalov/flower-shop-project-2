import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ProductCatalog from "@/components/ProductCatalog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";
import AdminPanel from "@/components/admin/AdminPanel";
import ModeratorPanel from "@/components/moderator/ModeratorPanel";
import ProductForm from "@/components/ProductForm";
import useAuth from "@/hooks/useAuth";
import useCart from "@/hooks/useCart";
import useChat from "@/hooks/useChat";
import useProducts from "@/hooks/useProducts";
import useSettings from "@/hooks/useSettings";
import { Product } from "@/types";

const Index = () => {
  const auth = useAuth();
  const cart = useCart();
  const chat = useChat();
  const productsHook = useProducts();
  const settings = useSettings();

  const [showLogin, setShowLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showModeratorPanel, setShowModeratorPanel] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);

  const handleLogin = () => {
    if (auth.login()) {
      setShowLogin(false);
    }
  };

  const handleShowProductDialog = (product: Product | null) => {
    setEditingProduct(product);
    setShowProductDialog(true);
  };

  const handleSaveProduct = (product: Omit<Product, 'id'>) => {
    productsHook.saveProduct(product, editingProduct);
    setEditingProduct(null);
    setShowProductDialog(false);
  };

  const handleApplyPromo = () => {
    cart.applyPromo(settings.promos);
  };

  const handleSendMessage = () => {
    chat.sendMessage(auth.currentUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-teal-50">
      {/* SEO Meta */}
      <div style={{ display: 'none' }}>
        <title>{settings.siteSettings.seoTitle}</title>
        <meta name="description" content={settings.siteSettings.seoDescription} />
        <meta name="keywords" content={settings.siteSettings.seoKeywords} />
      </div>
      
      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вход в систему</DialogTitle>
            <DialogDescription>Введите данные для входа в админ панель</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Логин"
              value={auth.loginForm.username}
              onChange={(e) => auth.setLoginForm({...auth.loginForm, username: e.target.value})}
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={auth.loginForm.password}
              onChange={(e) => auth.setLoginForm({...auth.loginForm, password: e.target.value})}
            />
            <Button onClick={handleLogin} className="w-full">Войти</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        products={productsHook.products}
        setProducts={productsHook.setProducts}
        siteSettings={settings.siteSettings}
        setSiteSettings={settings.setSiteSettings}
        promos={settings.promos}
        setPromos={settings.setPromos}
        users={auth.users}
        onShowProductDialog={handleShowProductDialog}
      />
      
      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => setShowProductDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Moderator Panel */}
      <ModeratorPanel
        isOpen={showModeratorPanel}
        onClose={() => setShowModeratorPanel(false)}
        conversations={chat.conversations}
        setConversations={chat.setConversations}
        selectedConversation={chat.selectedConversation}
        setSelectedConversation={chat.setSelectedConversation}
        newMessage={chat.newMessage}
        setNewMessage={chat.setNewMessage}
        onSendMessage={handleSendMessage}
      />
      
      {/* Floating Chat */}
      <FloatingChat
        isOpen={chat.chatOpen}
        onToggle={() => chat.setChatOpen(!chat.chatOpen)}
        conversations={chat.conversations}
        currentUser={auth.currentUser}
        selectedConversation={chat.selectedConversation}
        newMessage={chat.newMessage}
        setNewMessage={chat.setNewMessage}
        onSendMessage={handleSendMessage}
      />
      
      {/* Header */}
      <Header
        siteSettings={settings.siteSettings}
        isLoggedIn={auth.isLoggedIn}
        currentUser={auth.currentUser}
        onShowLogin={() => setShowLogin(true)}
        onShowAdminPanel={() => setShowAdminPanel(true)}
        onShowModeratorPanel={() => setShowModeratorPanel(true)}
        onLogout={auth.logout}
        cartItemsCount={cart.cartItemsCount}
      />

      {/* Hero Section */}
      <Hero siteSettings={settings.siteSettings} />

      {/* Features */}
      <Features />

      {/* Product Catalog */}
      <ProductCatalog
        products={productsHook.products}
        categories={productsHook.categories}
        selectedCategory={productsHook.selectedCategory}
        onCategoryChange={productsHook.setSelectedCategory}
        onAddToCart={cart.addToCart}
      />

      {/* Contact */}
      <Contact siteSettings={settings.siteSettings} />

      {/* Footer */}
      <Footer siteSettings={settings.siteSettings} />
    </div>
  );
};

export default Index;
    {
      guestId: "guest1",
      guestName: "Анна",
      messages: [
        {
          id: 1,
          user: "Анна",
          message: "Здравствуйте! Есть ли у вас розы?",
          timestamp: new Date(),
          role: "guest",
          guestId: "guest1",
        },
        {
          id: 2,
          user: "Модератор",
          message: "Да, конечно! У нас большой выбор роз. Что вас интересует?",
          timestamp: new Date(),
          role: "moderator",
        },
      ],
      unreadCount: 1,
    },
    {
      guestId: "guest2",
      guestName: "Михаил",
      messages: [
        {
          id: 3,
          user: "Михаил",
          message: "Можете подготовить букет к завтрашнему дню?",
          timestamp: new Date(),
          role: "guest",
          guestId: "guest2",
        },
      ],
      unreadCount: 1,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "Флора",
    heroTitle: "Свежие цветы для\\nособых моментов",
    heroSubtitle:
      "Создаем уникальные композиции и букеты для любого события. Доставка по всему городу в течение 2 часов.",
    phone: "+7 (495) 123-45-67",
    email: "info@flora-shop.ru",
    address: "Москва, ул. Цветочная, 123",
    workingHours: "Пн-Вс: 09:00 - 21:00",
    seoTitle: "Флора - Цветочный магазин в Москве | Доставка цветов",
    seoDescription:
      "Лучший цветочный магазин в Москве. Свежие цветы, букеты, композиции. Быстрая доставка по всему городу.",
    seoKeywords: "цветы, букеты, доставка цветов, флористика, розы, тюльпаны",
  });

  const [promos, setPromos] = useState<Promo[]>([
    {
      id: 1,
      code: "WELCOME15",
      discount: 15,
      type: "percentage",
      active: true,
      expiresAt: new Date("2024-12-31"),
      description: "Скидка 15% для новых клиентов",
    },
    {
      id: 2,
      code: "SPRING500",
      discount: 500,
      type: "fixed",
      active: true,
      expiresAt: new Date("2024-05-31"),
      description: "Скидка 500 руб на весенние букеты",
    },
  ]);

  const [users] = useState<User[]>([
    { id: 1, username: "admin", role: "admin", name: "Администратор" },
    {
      id: 2,
      username: "moderator1",
      role: "moderator",
      name: "Модератор Анна",
    },
    {
      id: 3,
      username: "moderator2",
      role: "moderator",
      name: "Модератор Иван",
    },
  ]);

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
    if (!product.inStock) return;

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

  const login = () => {
    const user = users.find((u) => u.username === loginForm.username);
    if (
      user &&
      (loginForm.password === "admin" || loginForm.password === "moderator")
    ) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowLogin(false);
      setLoginForm({ username: "", password: "" });
    }
  };

  const logout = () => {
    setCurrentUser({ id: 1, username: "guest", role: "guest", name: "Гость" });
    setIsLoggedIn(false);
    setShowAdminPanel(false);
    setShowModeratorPanel(false);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const guestId =
        currentUser.role === "guest" ? "current_guest" : selectedConversation;

      if (currentUser.role === "guest") {
        // Гость отправляет сообщение
        let conversation = conversations.find(
          (c) => c.guestId === "current_guest",
        );
        if (!conversation) {
          conversation = {
            guestId: "current_guest",
            guestName: "Посетитель",
            messages: [],
            unreadCount: 0,
          };
          setConversations([...conversations, conversation]);
        }

        const message: ChatMessage = {
          id: Date.now(),
          user: currentUser.name,
          message: newMessage,
          timestamp: new Date(),
          role: currentUser.role,
          guestId: "current_guest",
        };

        conversation.messages.push(message);
        conversation.unreadCount += 1;

        setConversations([...conversations]);
      } else if (selectedConversation) {
        // Модератор отвечает
        const conversation = conversations.find(
          (c) => c.guestId === selectedConversation,
        );
        if (conversation) {
          const message: ChatMessage = {
            id: Date.now(),
            user: currentUser.name,
            message: newMessage,
            timestamp: new Date(),
            role: currentUser.role,
            guestId: selectedConversation,
          };

          conversation.messages.push(message);
          conversation.unreadCount = 0;

          setConversations([...conversations]);
        }
      }

      setNewMessage("");
    }
  };

  const applyPromo = () => {
    const promo = promos.find((p) => p.code === promoCode && p.active);
    if (promo) {
      setAppliedPromo(promo);
      setPromoCode("");
    }
  };

  const saveProduct = (product: Omit<Product, "id">) => {
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
    setEditingProduct(null);
    setShowProductDialog(false);
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const saveSiteSettings = (settings: SiteSettings) => {
    setSiteSettings(settings);
  };

  const savePromo = (promo: Omit<Promo, "id">) => {
    setPromos([...promos, { ...promo, id: Date.now() }]);
  };

  const deletePromo = (id: number) => {
    setPromos(promos.filter((p) => p.id !== id));
  };

  const getTotalPrice = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    if (appliedPromo) {
      if (appliedPromo.type === "percentage") {
        return subtotal * (1 - appliedPromo.discount / 100);
      } else {
        return Math.max(0, subtotal - appliedPromo.discount);
      }
    }
    return subtotal;
  };

  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getDiscount = () => {
    if (!appliedPromo) return 0;
    const subtotal = getSubtotal();
    if (appliedPromo.type === "percentage") {
      return subtotal * (appliedPromo.discount / 100);
    } else {
      return Math.min(subtotal, appliedPromo.discount);
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
      {/* SEO Meta */}
      <div style={{ display: "none" }}>
        <title>{siteSettings.seoTitle}</title>
        <meta name="description" content={siteSettings.seoDescription} />
        <meta name="keywords" content={siteSettings.seoKeywords} />
      </div>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вход в систему</DialogTitle>
            <DialogDescription>
              Введите данные для входа в админ панель
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Логин"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm({ ...loginForm, username: e.target.value })
              }
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
            />
            <Button onClick={login} className="w-full">
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Panel */}
      <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Панель администратора</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="content">Контент</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="promos">Промокоды</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Управление товарами</h3>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductDialog(true);
                  }}
                >
                  <Icon name="Plus" className="h-4 w-4 mr-2" />
                  Добавить товар
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Изображение</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>В наличии</TableHead>
                    <TableHead>Рекомендуемый</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{product.price} ₽</span>
                          {product.oldPrice && (
                            <span className="text-gray-500 line-through text-sm">
                              {product.oldPrice} ₽
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Switch
                          checked={product.inStock}
                          onCheckedChange={(checked) => {
                            setProducts(
                              products.map((p) =>
                                p.id === product.id
                                  ? { ...p, inStock: checked }
                                  : p,
                              ),
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.featured}
                          onCheckedChange={(checked) => {
                            setProducts(
                              products.map((p) =>
                                p.id === product.id
                                  ? { ...p, featured: checked }
                                  : p,
                              ),
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductDialog(true);
                            }}
                          >
                            <Icon name="Edit" className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Icon name="Trash2" className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Удалить товар?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Товар будет
                                  удален навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <h3 className="text-lg font-semibold">Редактирование контента</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Название сайта</Label>
                  <Input
                    value={siteSettings.siteName}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        siteName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Заголовок на главной</Label>
                  <Textarea
                    value={siteSettings.heroTitle}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        heroTitle: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Подзаголовок</Label>
                  <Textarea
                    value={siteSettings.heroSubtitle}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        heroSubtitle: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Телефон</Label>
                  <Input
                    value={siteSettings.phone}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={siteSettings.email}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Адрес</Label>
                  <Input
                    value={siteSettings.address}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Часы работы</Label>
                  <Input
                    value={siteSettings.workingHours}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        workingHours: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={() => saveSiteSettings(siteSettings)}>
                Сохранить изменения
              </Button>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <h3 className="text-lg font-semibold">SEO настройки</h3>
              <div className="space-y-4">
                <div>
                  <Label>Мета-заголовок</Label>
                  <Input
                    value={siteSettings.seoTitle}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        seoTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Мета-описание</Label>
                  <Textarea
                    value={siteSettings.seoDescription}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        seoDescription: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Ключевые слова</Label>
                  <Input
                    value={siteSettings.seoKeywords}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        seoKeywords: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={() => saveSiteSettings(siteSettings)}>
                Сохранить SEO настройки
              </Button>
            </TabsContent>

            <TabsContent value="promos" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Промокоды и акции</h3>
                <Button
                  onClick={() =>
                    savePromo({
                      code: "NEW" + Date.now(),
                      discount: 10,
                      type: "percentage",
                      active: true,
                      expiresAt: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000,
                      ),
                      description: "Новый промокод",
                    })
                  }
                >
                  <Icon name="Plus" className="h-4 w-4 mr-2" />
                  Добавить промокод
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Код</TableHead>
                    <TableHead>Скидка</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Активен</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promos.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-mono">{promo.code}</TableCell>
                      <TableCell>
                        {promo.discount}
                        {promo.type === "percentage" ? "%" : " ₽"}
                      </TableCell>
                      <TableCell>
                        {promo.type === "percentage"
                          ? "Процент"
                          : "Фиксированная"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={promo.active}
                          onCheckedChange={(checked) => {
                            setPromos(
                              promos.map((p) =>
                                p.id === promo.id
                                  ? { ...p, active: checked }
                                  : p,
                              ),
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePromo(promo.id)}
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <h3 className="text-lg font-semibold">
                Управление пользователями
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Логин</TableHead>
                    <TableHead>Роль</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "destructive" : "secondary"
                          }
                        >
                          {user.role === "admin"
                            ? "Администратор"
                            : "Модератор"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Редактировать товар" : "Добавить товар"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSave={saveProduct}
            onCancel={() => setShowProductDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Moderator Panel */}
      <Dialog open={showModeratorPanel} onOpenChange={setShowModeratorPanel}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Панель модератора</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Диалоги с гостями</h4>
              {conversations.map((conversation) => (
                <div
                  key={conversation.guestId}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedConversation === conversation.guestId
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedConversation(conversation.guestId)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {conversation.guestName}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {
                      conversation.messages[conversation.messages.length - 1]
                        ?.message
                    }
                  </p>
                </div>
              ))}
            </div>
            <div className="md:col-span-2">
              {selectedConversation ? (
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg">
                    {conversations
                      .find((c) => c.guestId === selectedConversation)
                      ?.messages.map((msg) => (
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
                      placeholder="Ответить гостю..."
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Icon name="Send" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Выберите диалог для просмотра
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Chat */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${chatOpen ? "w-80" : "w-auto"}`}
      >
        {chatOpen ? (
          <div className="bg-white rounded-lg shadow-2xl border animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Онлайн консультация</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatOpen(false)}
              >
                <Icon name="X" className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {currentUser.role === "guest"
                ? // Гость видит свою беседу
                  conversations
                    .find((c) => c.guestId === "current_guest")
                    ?.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "guest" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-2 rounded-lg ${
                            msg.role === "guest"
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))
                : // Модератор видит выбранную беседу
                  selectedConversation &&
                  conversations
                    .find((c) => c.guestId === selectedConversation)
                    ?.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "guest" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[70%] p-2 rounded-lg ${
                            msg.role === "guest"
                              ? "bg-gray-200 text-gray-800"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
              {conversations.find(
                (c) =>
                  c.guestId ===
                  (currentUser.role === "guest"
                    ? "current_guest"
                    : selectedConversation),
              )?.messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Icon name="MessageCircle" className="h-8 w-8 mx-auto mb-2" />
                  <p>Начните диалог</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Напишите сообщение..."
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage} size="sm">
                  <Icon name="Send" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setChatOpen(true)}
            className="rounded-full h-14 w-14 bg-pink-500 hover:bg-pink-600 shadow-lg animate-pulse"
          >
            <Icon name="MessageCircle" className="h-6 w-6" />
          </Button>
        )}
      </div>

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
                {siteSettings.siteName}
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
              {/* Admin/Moderator Login */}
              {!isLoggedIn ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogin(true)}
                >
                  <Icon name="Settings" className="h-4 w-4 mr-2" />
                  Вход
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Привет, {currentUser.name}!
                  </span>
                  {currentUser.role === "admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdminPanel(true)}
                    >
                      <Icon name="Settings" className="h-4 w-4 mr-2" />
                      Админ панель
                    </Button>
                  )}
                  {currentUser.role === "moderator" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModeratorPanel(true)}
                    >
                      <Icon name="Users" className="h-4 w-4 mr-2" />
                      Модератор
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={logout}>
                    <Icon name="LogOut" className="h-4 w-4 mr-2" />
                    Выход
                  </Button>
                </div>
              )}

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
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Промокод"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <Button onClick={applyPromo} variant="outline">
                              Применить
                            </Button>
                          </div>
                          {appliedPromo && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                              Промокод {appliedPromo.code} применен! Скидка:{" "}
                              {appliedPromo.discount}
                              {appliedPromo.type === "percentage" ? "%" : " ₽"}
                            </div>
                          )}
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Подытог:</span>
                            <span>{getSubtotal().toLocaleString()} ₽</span>
                          </div>
                          {appliedPromo && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Скидка ({appliedPromo.code}):</span>
                              <span>-{getDiscount().toLocaleString()} ₽</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Итого:</span>
                            <span>{getTotalPrice().toLocaleString()} ₽</span>
                          </div>
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
                {siteSettings.heroTitle.split("\\n").map((line, i) => (
                  <span key={i}>
                    {line.includes("особых") ? (
                      <span className="text-pink-500">{line}</span>
                    ) : (
                      line
                    )}
                    {i < siteSettings.heroTitle.split("\\n").length - 1 && (
                      <br />
                    )}
                  </span>
                ))}
              </h2>
              <p
                className="text-xl text-gray-600"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                {siteSettings.heroSubtitle}
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
                      onClick={() => addToCart(product)}
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
                  <span>{siteSettings.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Mail" className="h-5 w-5 text-pink-500" />
                  <span>{siteSettings.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="MapPin" className="h-5 w-5 text-pink-500" />
                  <span>{siteSettings.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Clock" className="h-5 w-5 text-pink-500" />
                  <span>{siteSettings.workingHours}</span>
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
                <span className="text-xl font-bold">
                  {siteSettings.siteName}
                </span>
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
                <li>{siteSettings.phone}</li>
                <li>{siteSettings.email}</li>
                <li>{siteSettings.address}</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 {siteSettings.siteName}. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;