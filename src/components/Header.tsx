import React from "react";
import { motion } from "framer-motion";
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
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-md border-b sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <span className="text-3xl">🌸</span>
            <h1
              className="text-2xl font-bold text-pink-600"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Bloom & Blossom
            </h1>
          </motion.div>

          <nav className="hidden md:flex space-x-8">
            <motion.a
              href="#home"
              className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Главная
            </motion.a>
            <motion.a
              href="#catalog"
              className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Каталог
            </motion.a>
            <motion.a
              href="#contact"
              className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Контакты
            </motion.a>
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
    </motion.header>
  );
};

export default Header;
