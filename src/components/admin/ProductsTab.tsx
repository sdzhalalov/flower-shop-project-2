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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Icon from "@/components/ui/icon";
import { Product } from "@/types";

interface ProductsTabProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  onShowProductDialog: (product: Product | null) => void;
  onDeleteProduct: (id: number) => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  setProducts,
  onShowProductDialog,
  onDeleteProduct,
}) => {
  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Управление товарами</h3>
        <Button onClick={() => onShowProductDialog(null)}>
          <Icon name="Plus" className="h-4 w-4 mr-2" />
          Добавить товар
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Изображение</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Цена</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>В наличии</TableHead>
            <TableHead>Рекомендуемый</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-12 w-12 object-cover rounded"
                />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span>{product.price} ₽</span>
                  {product.oldPrice && (
                    <span className="text-gray-500 line-through text-sm">
                      {product.oldPrice} ₽
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                <Switch
                  checked={product.inStock}
                  onCheckedChange={(checked) =>
                    updateProduct(product.id, { inStock: checked })
                  }
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={product.featured}
                  onCheckedChange={(checked) =>
                    updateProduct(product.id, { featured: checked })
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShowProductDialog(product)}
                  >
                    <Icon name="Edit" className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить. Товар будет удален
                          навсегда.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteProduct(product.id)}
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTab;
