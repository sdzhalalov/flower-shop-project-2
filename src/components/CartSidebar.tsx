import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <Button variant="outline" size="sm">
          <Icon name="ShoppingCart" className="h-4 w-4 mr-2" />
          Корзина ({cartItemsCount})
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Корзина</SheetTitle>
          <SheetDescription>Ваши выбранные товары</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Корзина пуста</p>
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
                    <p className="text-sm text-gray-500">{item.price} ₽</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdateQuantity?.(item.id, item.quantity - 1)
                      }
                    >
                      <Icon name="Minus" className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdateQuantity?.(item.id, item.quantity + 1)
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
              <Button className="w-full" size="lg">
                Оформить заказ
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
