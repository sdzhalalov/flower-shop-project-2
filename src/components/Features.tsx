import React from "react";
import Icon from "@/components/ui/icon";

const Features: React.FC = () => {
  const features = [
    {
      icon: "Truck",
      title: "Быстрая доставка",
      description: "Доставим ваш заказ в течение 2 часов по всему городу",
      bgColor: "bg-pink-100",
      iconColor: "text-pink-500",
    },
    {
      icon: "Flower2",
      title: "Свежие цветы",
      description: "Работаем только с проверенными поставщиками",
      bgColor: "bg-teal-100",
      iconColor: "text-teal-500",
    },
    {
      icon: "Heart",
      title: "Индивидуальный подход",
      description: "Создаем уникальные композиции по вашему желанию",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div
                className={`${feature.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <Icon
                  name={feature.icon as any}
                  className={`h-8 w-8 ${feature.iconColor}`}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
