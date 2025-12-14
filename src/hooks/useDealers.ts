import { useApp } from '@/contexts/AppContext';
import { Dealer } from '@/types';
import { useMemo } from 'react';

/**
 * Custom hook for dealer management operations
 * Provides convenient access to dealer CRUD operations and utilities
 */
export function useDealers() {
  const { dealers, addDealer, updateDealer, deleteDealer } = useApp();

  /**
   * Get dealer by ID
   */
  const getDealerById = useMemo(() => {
    return (id: string): Dealer | undefined => {
      return dealers.find((dealer) => dealer.id === id);
    };
  }, [dealers]);

  /**
   * Search dealers by query string
   */
  const searchDealers = useMemo(() => {
    return (query: string): Dealer[] => {
      if (!query.trim()) return dealers;
      
      const lowerQuery = query.toLowerCase();
      return dealers.filter(
        (dealer) =>
          dealer.dealerName.toLowerCase().includes(lowerQuery) ||
          dealer.shopName.toLowerCase().includes(lowerQuery) ||
          dealer.mobileNumber.includes(lowerQuery) ||
          (dealer.address && dealer.address.toLowerCase().includes(lowerQuery)) ||
          (dealer.notes && dealer.notes.toLowerCase().includes(lowerQuery))
      );
    };
  }, [dealers]);

  /**
   * Get dealers sorted by name
   */
  const getDealersSorted = useMemo(() => {
    return (sortBy: 'name' | 'shop' | 'date' = 'name'): Dealer[] => {
      const sorted = [...dealers];
      switch (sortBy) {
        case 'name':
          return sorted.sort((a, b) => a.dealerName.localeCompare(b.dealerName));
        case 'shop':
          return sorted.sort((a, b) => a.shopName.localeCompare(b.shopName));
        case 'date':
          return sorted.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Newest first
          });
        default:
          return sorted;
      }
    };
  }, [dealers]);

  /**
   * Check if dealer exists by mobile number
   */
  const dealerExistsByMobile = useMemo(() => {
    return (mobileNumber: string, excludeId?: string): boolean => {
      return dealers.some(
        (dealer) =>
          dealer.mobileNumber === mobileNumber && dealer.id !== excludeId
      );
    };
  }, [dealers]);

  return {
    // Data
    dealers,
    
    // CRUD Operations
    addDealer,
    updateDealer,
    deleteDealer,
    
    // Utilities
    getDealerById,
    searchDealers,
    getDealersSorted,
    dealerExistsByMobile,
    
    // Computed
    totalDealers: dealers.length,
  };
}

