import React from "react";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { SiteSettings } from "@/types";

interface FooterProps {
  siteSettings: SiteSettings;
}

const Footer: React.FC<FooterProps> = ({ siteSettings }) => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Icon name="Flower" className="h-6 w-6 text-pink-500" />
              <span className="text-xl font-bold">{siteSettings.siteName}</span>
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
  );
};

export default Footer;
