import React from "react";
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2
              className="text-4xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Свяжитесь с нами
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Icon name="Phone" className="h-5 w-5 text-pink-500" />
                <span>{siteSettings.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="Mail" className="h-5 w-5 text-pink-500" />
                <span>{siteSettings.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="MapPin" className="h-5 w-5 text-pink-500" />
                <span>{siteSettings.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="Clock" className="h-5 w-5 text-pink-500" />
                <span>{siteSettings.workingHours}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Оставьте заявку</h3>
            <form className="space-y-4">
              <Input placeholder="Ваше имя" />
              <Input type="email" placeholder="Email" />
              <Input type="tel" placeholder="Телефон" />
              <Textarea placeholder="Сообщение" rows={4} />
              <Button className="w-full bg-pink-500 hover:bg-pink-600">
                Отправить заявку
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
