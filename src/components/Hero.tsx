import React from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { SiteSettings } from "@/types";

interface HeroProps {
  siteSettings: SiteSettings;
}

const Hero: React.FC<HeroProps> = ({ siteSettings }) => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2
              className="text-5xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {siteSettings.heroTitle.split("\\n").map((line, i) => (
                <span key={i}>
                  {line.includes("особых") ? (
                    <span className="text-pink-500">{line}</span>
                  ) : (
                    line
                  )}
                  {i < siteSettings.heroTitle.split("\\n").length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p
              className="text-xl text-gray-600"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              {siteSettings.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-pink-500 hover:bg-pink-600">
                <Icon name="ShoppingBag" className="h-5 w-5 mr-2" />
                Посмотреть каталог
              </Button>
              <Button variant="outline" size="lg">
                <Icon name="Phone" className="h-5 w-5 mr-2" />
                Связаться с нами
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="/img/b3442a81-3a91-4e32-b748-8adda98e9986.jpg"
              alt="Букет цветов"
              className="w-full h-96 object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2">
                <Icon
                  name="Star"
                  className="h-5 w-5 text-yellow-400 fill-current"
                />
                <span className="font-semibold">4.9</span>
                <span className="text-gray-500">из 5</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Более 1000 отзывов</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
