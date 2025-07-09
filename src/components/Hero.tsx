import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { SiteSettings } from "@/types";

interface HeroProps {
  siteSettings: SiteSettings;
}

const Hero: React.FC<HeroProps> = ({ siteSettings }) => {
  return (
    <section
      id="home"
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <span className="text-pink-600">Bloom & Blossom</span>
              <br />
              Свежие цветы для <span className="text-pink-500">
                особых
              </span>{" "}
              моментов
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              Создаем незабываемые моменты с помощью природной красоты. Букеты
              ручной работы от профессиональных флористов.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() =>
                  document
                    .getElementById("catalog")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Icon name="ShoppingBag" className="h-5 w-5 mr-2" />
                Посмотреть каталог
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Icon name="Phone" className="h-5 w-5 mr-2" />
                Связаться с нами
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              src="/img/ee172049-873a-474a-8195-75ff6c4d5850.jpg"
              alt="Букет цветов"
              className="w-full h-96 object-cover rounded-2xl shadow-2xl"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <Icon
                  name="Star"
                  className="h-5 w-5 text-yellow-400 fill-current"
                />
                <span className="font-semibold">4.9</span>
                <span className="text-gray-500">из 5</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Более 1000 отзывов</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
