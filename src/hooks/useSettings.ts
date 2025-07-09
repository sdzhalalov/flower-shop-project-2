import { useState } from "react";
import { SiteSettings, Promo } from "@/types";

const useSettings = () => {
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

  const savePromo = (promo: Omit<Promo, "id">) => {
    setPromos([...promos, { ...promo, id: Date.now() }]);
  };

  const deletePromo = (id: number) => {
    setPromos(promos.filter((p) => p.id !== id));
  };

  return {
    siteSettings,
    setSiteSettings,
    promos,
    setPromos,
    savePromo,
    deletePromo,
  };
};

export default useSettings;
