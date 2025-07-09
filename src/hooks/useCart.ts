import { useState } from "react";
import { CartItem, Product, Promo } from "@/types";

const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoCode, setPromoCode] = useState("");

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

  const getTotalPrice = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    return Math.max(0, subtotal - discount);
  };

  const applyPromo = (promos: Promo[]) => {
    const promo = promos.find((p) => p.code === promoCode && p.active);
    if (promo) {
      setAppliedPromo(promo);
      setPromoCode("");
      return true;
    }
    return false;
  };

  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return {
    cartItems,
    appliedPromo,
    promoCode,
    setPromoCode,
    addToCart,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getDiscount,
    getTotalPrice,
    applyPromo,
    cartItemsCount,
  };
};

export default useCart;
