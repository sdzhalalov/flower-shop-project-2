import { useState } from "react";
import { SiteSettings, Promo } from "@/types";

const useSettings = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "Bloom & Blossom",
    heroTitle: "Bloom & Blossom\\nСвежие цветы для особых моментов",
    heroSubtitle:
      "Создаем незабываемые моменты с помощью природной красоты. Букеты ручной работы от профессиональных флористов.",
    phone: "+7 (495) 555-77-88",
    email: "info@bloomblossom.ru",
    address: "г. Москва, ул. Цветочная, д. 25",
    workingHours: "Ежедневно: 8:00-22:00",
    seoTitle: "Bloom & Blossom - Цветочный магазин в Москве | Доставка цветов",
    seoDescription:
      "Свежие цветы и красивые букеты на любой повод. Доставка по Москве. Создаем незабываемые моменты с помощью природной красоты.",
    seoKeywords:
      "цветы, букеты, доставка цветов, розы, тюльпаны, пионы, растения, Bloom Blossom",
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
