import React, { useState, useCallback, useMemo } from 'react';
import { DBItem, ItemVariant } from '@/types';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface ItemSelectionModalProps {
  item: DBItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemSelectionModal: React.FC<ItemSelectionModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { addItemToBill } = useApp();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

  const variants = useMemo(() => item?.variants || [], [item]);

  const selectedVariant = useMemo(() => {
    return variants.find((v) => v.id === selectedVariantId);
  }, [variants, selectedVariantId]);

  // Reset state when the modal opens/closes
  React.useEffect(() => {
    if (isOpen && variants.length > 0) {
      // Select the first variant by default
      setSelectedVariantId(variants[0].id);
      setQuantity(1);
      setPrice(0);
    } else if (!isOpen) {
      setSelectedVariantId('');
      setQuantity(1);
      setPrice(0);
    }
  }, [isOpen, variants]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 1) {
        setQuantity(value);
      }
    },
    []
  );

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value >= 0) {
        setPrice(value);
      } else if (e.target.value === '') {
        setPrice(0);
      }
    },
    []
  );

  const handleAddToBill = useCallback(() => {
    if (!item || !selectedVariantId || quantity < 1 || price <= 0) {
      toast.error('Please select a variant, set a valid quantity, and enter a price.');
      return;
    }

    const variant = variants.find((v) => v.id === selectedVariantId);
    if (!variant) {
      toast.error('Selected variant not found.');
      return;
    }

    addItemToBill(item, selectedVariantId, quantity, price);
    toast.success(
      `${quantity} x ${item.name} (${variant.size}) added to bill.`
    );
    onClose();
  }, [item, selectedVariantId, quantity, price, variants, addItemToBill, onClose]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Variant for {item.name}</DialogTitle>
          <DialogDescription>
            Choose the size, price, and quantity for the item.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variant" className="text-right">
              Size
            </Label>
            <div className="col-span-3">
              <RadioGroup
                value={selectedVariantId}
                onValueChange={setSelectedVariantId}
                className="flex flex-col space-y-1"
              >
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center space-x-3 space-y-0"
                  >
                    <RadioGroupItem value={variant.id} id={variant.id} />
                    <Label htmlFor={variant.id} className="flex justify-between w-full cursor-pointer">
                      <span>Size: {variant.size}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (₹)
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={handlePriceChange}
              min="0"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              className="col-span-3"
            />
          </div>
          {selectedVariant && (
            <div className="text-center mt-2 p-2 bg-gray-100 rounded-md">
              <p className="text-lg font-bold">
                Total: ₹{(price * quantity).toFixed(2)}
              </p>
            </div>
          )}
        </div>
        <Button onClick={handleAddToBill} disabled={!selectedVariant || quantity < 1}>
          Add to Bill
        </Button>
      </DialogContent>
    </Dialog>
  );
};
