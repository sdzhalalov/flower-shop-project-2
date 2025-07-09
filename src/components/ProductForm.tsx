import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  featured: boolean;
}

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Omit<Product, "id">) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price || 0,
    oldPrice: product?.oldPrice || 0,
    image: product?.image || "",
    category: product?.category || "bouquets",
    description: product?.description || "",
    inStock: product?.inStock || true,
    featured: product?.featured || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      oldPrice: formData.oldPrice > 0 ? formData.oldPrice : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Название товара</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Цена (₽)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="oldPrice">Старая цена (₽)</Label>
          <Input
            id="oldPrice"
            type="number"
            value={formData.oldPrice}
            onChange={(e) =>
              setFormData({ ...formData, oldPrice: Number(e.target.value) })
            }
            placeholder="Опционально"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">URL изображения</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Категория</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bouquets">Букеты</SelectItem>
            <SelectItem value="compositions">Композиции</SelectItem>
            <SelectItem value="wedding">Свадебные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="inStock"
            checked={formData.inStock}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, inStock: checked })
            }
          />
          <Label htmlFor="inStock">В наличии</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, featured: checked })
            }
          />
          <Label htmlFor="featured">Рекомендуемый</Label>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" className="flex-1">
          Сохранить
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
