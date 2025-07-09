import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { CartItem, Promo } from "@/types";

interface CartSidebarProps {
  cartItemsCount: number;
  cartItems?: CartItem[];
  appliedPromo?: Promo | null;
  promoCode?: string;
  setPromoCode?: (code: string) => void;
  onApplyPromo?: () => void;
  onUpdateQuantity?: (id: number, quantity: number) => void;
  getSubtotal?: () => number;
  getDiscount?: () => number;
  getTotalPrice?: () => number;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cartItemsCount,
  cartItems = [],
  appliedPromo,
  promoCode = "",
  setPromoCode,
  onApplyPromo,
  onUpdateQuantity,
  getSubtotal,
  getDiscount,
  getTotalPrice,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="relative bg-pink-600 hover:bg-pink-700">
            <Icon name="ShoppingBag" className="h-5 w-5 mr-2" />
            Корзина
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-black px-2 py-1 text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Корзина</SheetTitle>
          <SheetDescription>Ваши выбранные товары</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Icon
                name="ShoppingBag"
                className="h-16 w-16 text-gray-300 mx-auto mb-4"
              />
              <p className="text-gray-500">Корзина пуста</p>
              <p className="text-sm text-gray-400 mt-2">
                Добавьте товары из каталога
              </p>
            </motion.div>
          ) : (
            <>
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 border rounded-lg bg-gradient-to-r from-white to-pink-50"
                  >
                    <motion.img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 object-cover rounded-lg"
                      whileHover={{ scale: 1.05 }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-lg font-semibold text-pink-600">
                        {item.price} ₽
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onUpdateQuantity?.(item.id, item.quantity - 1)
                          }
                        >
                          <Icon name="Minus" className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onUpdateQuantity?.(item.id, item.quantity + 1)
                          }
                        >
                          <Icon name="Plus" className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onUpdateQuantity?.(item.id, 0)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Icon name="X" className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Промокод"
                    value={promoCode}
                    onChange={(e) => setPromoCode?.(e.target.value)}
                  />
                  <Button onClick={onApplyPromo} variant="outline">
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
                  <span>{getSubtotal?.().toLocaleString()} ₽</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Скидка ({appliedPromo.code}):</span>
                    <span>-{getDiscount?.().toLocaleString()} ₽</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Итого:</span>
                  <span>{getTotalPrice?.().toLocaleString()} ₽</span>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  size="lg"
                >
                  Оформить заказ
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
