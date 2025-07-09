import React from "react";
import { Button } from "@/components/ui/button";

import Icon from "@/components/ui/icon";
import { User, SiteSettings } from "@/types";
import CartSidebar from "./CartSidebar";

interface HeaderProps {
  siteSettings: SiteSettings;
  isLoggedIn: boolean;
  currentUser: User;
  onShowLogin: () => void;
  onShowAdminPanel: () => void;
  onShowModeratorPanel: () => void;
  onLogout: () => void;
  cartItemsCount: number;
}

const Header: React.FC<HeaderProps> = ({
  siteSettings,
  isLoggedIn,
  currentUser,
  onShowLogin,
  onShowAdminPanel,
  onShowModeratorPanel,
  onLogout,
  cartItemsCount,
}) => {
  return (
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
              <Button variant="outline" size="sm" onClick={onShowLogin}>
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
                    onClick={onShowAdminPanel}
                  >
                    <Icon name="Settings" className="h-4 w-4 mr-2" />
                    Админ панель
                  </Button>
                )}
                {currentUser.role === "moderator" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowModeratorPanel}
                  >
                    <Icon name="Users" className="h-4 w-4 mr-2" />
                    Модератор
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <Icon name="LogOut" className="h-4 w-4 mr-2" />
                  Выход
                </Button>
              </div>
            )}

            {/* Cart */}
            <CartSidebar cartItemsCount={cartItemsCount} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
