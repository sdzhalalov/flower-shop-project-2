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

  const handleSaveProduct = (product: Omit<Product, "id">) => {
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
      <div style={{ display: "none" }}>
        <title>{settings.siteSettings.seoTitle}</title>
        <meta
          name="description"
          content={settings.siteSettings.seoDescription}
        />
        <meta name="keywords" content={settings.siteSettings.seoKeywords} />
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
              value={auth.loginForm.username}
              onChange={(e) =>
                auth.setLoginForm({
                  ...auth.loginForm,
                  username: e.target.value,
                })
              }
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={auth.loginForm.password}
              onChange={(e) =>
                auth.setLoginForm({
                  ...auth.loginForm,
                  password: e.target.value,
                })
              }
            />
            <Button onClick={handleLogin} className="w-full">
              Войти
            </Button>
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
            <DialogTitle>
              {editingProduct ? "Редактировать товар" : "Добавить товар"}
            </DialogTitle>
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
