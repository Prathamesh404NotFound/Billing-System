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
    } else if (!isOpen) {
      setSelectedVariantId('');
      setQuantity(1);
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

  const handleAddToBill = useCallback(() => {
    if (!item || !selectedVariantId || quantity < 1) {
      toast.error('Please select a variant and a valid quantity.');
      return;
    }

    const variant = variants.find((v) => v.id === selectedVariantId);
    if (!variant) {
      toast.error('Selected variant not found.');
      return;
    }

    if (variant.stock < quantity) {
      toast.warning(
        `Only ${variant.stock} units of ${item.name} (${variant.size}) are in stock.`
      );
      // Optionally, set quantity to max available stock
      // setQuantity(variant.stock);
      // return;
    }

    addItemToBill(item, selectedVariantId, quantity);
    toast.success(
      `${quantity} x ${item.name} (${variant.size}) added to bill.`
    );
    onClose();
  }, [item, selectedVariantId, quantity, variants, addItemToBill, onClose]);

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
              Size/Price
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
                      <span className="font-semibold">₹{variant.price}</span>
                      <span className="text-xs text-gray-500">
                        (Stock: {variant.stock})
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
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
                Total: ₹{(selectedVariant.price * quantity).toFixed(2)}
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
