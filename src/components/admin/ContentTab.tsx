import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SiteSettings } from "@/types";

interface ContentTabProps {
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
}

const ContentTab: React.FC<ContentTabProps> = ({
  siteSettings,
  setSiteSettings,
}) => {
  const updateSetting = (key: keyof SiteSettings, value: string) => {
    setSiteSettings({ ...siteSettings, [key]: value });
  };

  const saveSiteSettings = () => {
    // В реальном приложении здесь был бы вызов API
    console.log("Сохранение настроек:", siteSettings);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Редактирование контента</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Название сайта</Label>
          <Input
            value={siteSettings.siteName}
            onChange={(e) => updateSetting("siteName", e.target.value)}
          />
        </div>
        <div>
          <Label>Заголовок на главной</Label>
          <Textarea
            value={siteSettings.heroTitle}
            onChange={(e) => updateSetting("heroTitle", e.target.value)}
            rows={2}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Подзаголовок</Label>
          <Textarea
            value={siteSettings.heroSubtitle}
            onChange={(e) => updateSetting("heroSubtitle", e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <Label>Телефон</Label>
          <Input
            value={siteSettings.phone}
            onChange={(e) => updateSetting("phone", e.target.value)}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            value={siteSettings.email}
            onChange={(e) => updateSetting("email", e.target.value)}
          />
        </div>
        <div>
          <Label>Адрес</Label>
          <Input
            value={siteSettings.address}
            onChange={(e) => updateSetting("address", e.target.value)}
          />
        </div>
        <div>
          <Label>Часы работы</Label>
          <Input
            value={siteSettings.workingHours}
            onChange={(e) => updateSetting("workingHours", e.target.value)}
          />
        </div>
      </div>
      <Button onClick={saveSiteSettings}>Сохранить изменения</Button>
    </div>
  );
};

export default ContentTab;
