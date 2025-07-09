import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { SiteSettings } from "@/types";

interface ContactProps {
  siteSettings: SiteSettings;
}

const Contact: React.FC<ContactProps> = ({ siteSettings }) => {
  return (
    <section
      id="contact"
      className="py-16 bg-gradient-to-b from-pink-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-gray-900 mb-12 text-center"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Контакты
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">
              Наши контакты
            </h3>
            <div className="space-y-6">
              <motion.div
                className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Icon name="MapPin" className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Адрес</h4>
                  <p className="text-gray-600">
                    г. Москва, ул. Цветочная, д. 25
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Icon name="Phone" className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Телефон</h4>
                  <p className="text-gray-600">+7 (495) 555-77-88</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Icon name="Mail" className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600">info@bloomblossom.ru</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Icon name="Clock" className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Время работы</h4>
                  <p className="text-gray-600">Ежедневно: 8:00-22:00</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Icon name="Truck" className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Доставка</h4>
                  <p className="text-gray-600">Круглосуточно по Москве</p>
                  <p className="text-sm text-gray-500">
                    Обычная: 2-3 ч (500₽) • Срочная: 1 ч (1000₽)
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">
              Оставьте заявку
            </h3>
            <motion.form
              className="space-y-6"
              onSubmit={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Input
                  placeholder="Ваше имя"
                  className="border-pink-200 focus:border-pink-500"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Input
                  type="email"
                  placeholder="Email"
                  className="border-pink-200 focus:border-pink-500"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Input
                  type="tel"
                  placeholder="Телефон"
                  className="border-pink-200 focus:border-pink-500"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Textarea
                  placeholder="Сообщение"
                  rows={4}
                  className="border-pink-200 focus:border-pink-500"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full bg-pink-600 hover:bg-pink-700 py-3 text-lg">
                  <Icon name="Send" className="h-5 w-5 mr-2" />
                  Отправить заявку
                </Button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
