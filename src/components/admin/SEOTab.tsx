import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SiteSettings } from "@/types";

interface SEOTabProps {
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
}

const SEOTab: React.FC<SEOTabProps> = ({ siteSettings, setSiteSettings }) => {
  const updateSetting = (key: keyof SiteSettings, value: string) => {
    setSiteSettings({ ...siteSettings, [key]: value });
  };

  const saveSEOSettings = () => {
    // В реальном приложении здесь был бы вызов API
    console.log("Сохранение SEO настроек:", siteSettings);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">SEO настройки</h3>
      <div className="space-y-4">
        <div>
          <Label>Мета-заголовок</Label>
          <Input
            value={siteSettings.seoTitle}
            onChange={(e) => updateSetting("seoTitle", e.target.value)}
          />
        </div>
        <div>
          <Label>Мета-описание</Label>
          <Textarea
            value={siteSettings.seoDescription}
            onChange={(e) => updateSetting("seoDescription", e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <Label>Ключевые слова</Label>
          <Input
            value={siteSettings.seoKeywords}
            onChange={(e) => updateSetting("seoKeywords", e.target.value)}
          />
        </div>
      </div>
      <Button onClick={saveSEOSettings}>Сохранить SEO настройки</Button>
    </div>
  );
};

export default SEOTab;
