import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import Icon from "@/components/ui/icon";
import { Promo } from "@/types";

interface PromosTabProps {
  promos: Promo[];
  setPromos: (promos: Promo[]) => void;
  onSavePromo: (promo: Omit<Promo, "id">) => void;
  onDeletePromo: (id: number) => void;
}

const PromosTab: React.FC<PromosTabProps> = ({
  promos,
  setPromos,
  onSavePromo,
  onDeletePromo,
}) => {
  const updatePromo = (id: number, updates: Partial<Promo>) => {
    setPromos(promos.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addNewPromo = () => {
    onSavePromo({
      code: "NEW" + Date.now(),
      discount: 10,
      type: "percentage",
      active: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: "Новый промокод",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Промокоды и акции</h3>
        <Button onClick={addNewPromo}>
          <Icon name="Plus" className="h-4 w-4 mr-2" />
          Добавить промокод
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Код</TableHead>
            <TableHead>Скидка</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Активен</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promos.map((promo) => (
            <TableRow key={promo.id}>
              <TableCell className="font-mono">{promo.code}</TableCell>
              <TableCell>
                {promo.discount}
                {promo.type === "percentage" ? "%" : " ₽"}
              </TableCell>
              <TableCell>
                {promo.type === "percentage" ? "Процент" : "Фиксированная"}
              </TableCell>
              <TableCell>
                <Switch
                  checked={promo.active}
                  onCheckedChange={(checked) =>
                    updatePromo(promo.id, { active: checked })
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeletePromo(promo.id)}
                >
                  <Icon name="Trash2" className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PromosTab;
