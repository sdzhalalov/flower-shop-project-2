import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, Promo, User, SiteSettings } from "@/types";
import ProductsTab from "./ProductsTab";
import ContentTab from "./ContentTab";
import SEOTab from "./SEOTab";
import PromosTab from "./PromosTab";
import UsersTab from "./UsersTab";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
  promos: Promo[];
  setPromos: (promos: Promo[]) => void;
  users: User[];
  onShowProductDialog: (product: Product | null) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  setProducts,
  siteSettings,
  setSiteSettings,
  promos,
  setPromos,
  users,
  onShowProductDialog,
}) => {
  const saveProduct = (product: Omit<Product, "id">) => {
    setProducts([...products, { ...product, id: Date.now() }]);
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const savePromo = (promo: Omit<Promo, "id">) => {
    setPromos([...promos, { ...promo, id: Date.now() }]);
  };

  const deletePromo = (id: number) => {
    setPromos(promos.filter((p) => p.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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

          <TabsContent value="products">
            <ProductsTab
              products={products}
              setProducts={setProducts}
              onShowProductDialog={onShowProductDialog}
              onDeleteProduct={deleteProduct}
            />
          </TabsContent>

          <TabsContent value="content">
            <ContentTab
              siteSettings={siteSettings}
              setSiteSettings={setSiteSettings}
            />
          </TabsContent>

          <TabsContent value="seo">
            <SEOTab
              siteSettings={siteSettings}
              setSiteSettings={setSiteSettings}
            />
          </TabsContent>

          <TabsContent value="promos">
            <PromosTab
              promos={promos}
              setPromos={setPromos}
              onSavePromo={savePromo}
              onDeletePromo={deletePromo}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab users={users} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
