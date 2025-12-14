# Firebase Realtime Database Security Rules

## Overview
These security rules should be added to your Firebase Realtime Database to protect dealer, inventory, and purchase data.

## Rules Configuration

```json
{
  "rules": {
    "dealers": {
      ".read": true,
      ".write": "auth != null",
      "$dealerId": {
        ".validate": "newData.hasChildren(['id', 'dealerName', 'shopName', 'mobileNumber']) && 
                      newData.child('dealerName').isString() && 
                      newData.child('shopName').isString() && 
                      newData.child('mobileNumber').isString() &&
                      newData.child('mobileNumber').val().matches(/^[\\d+\\s-]+$/)"
      }
    },
    "inventory": {
      ".read": true,
      ".write": "auth != null",
      "$inventoryId": {
        ".validate": "newData.hasChildren(['itemId', 'itemName', 'stock', 'costPrice', 'sellingPrice']) && 
                      newData.child('stock').isNumber() && 
                      newData.child('stock').val() >= 0 &&
                      newData.child('costPrice').isNumber() && 
                      newData.child('costPrice').val() >= 0 &&
                      newData.child('sellingPrice').isNumber() && 
                      newData.child('sellingPrice').val() >= 0"
      }
    },
    "dealerPurchases": {
      ".read": true,
      ".write": "auth != null",
      "$purchaseId": {
        ".validate": "newData.hasChildren(['id', 'dealerId', 'purchaseDate', 'items', 'totalValue']) && 
                      newData.child('totalValue').isNumber() && 
                      newData.child('totalValue').val() >= 0"
      }
    },
    "stockHistory": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "items": {
      ".read": true,
      ".write": "auth != null"
    },
    "bills": {
      ".read": true,
      ".write": "auth != null"
    },
    "categories": {
      ".read": true,
      ".write": "auth != null"
    },
    "alterations": {
      ".read": true,
      ".write": "auth != null"
    },
    "settings": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## Development Rules (Less Restrictive)

For development/testing, you can use these more permissive rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **Warning**: Never use development rules in production!

## Implementation Steps

1. Go to Firebase Console → Realtime Database → Rules
2. Replace the existing rules with the production rules above
3. Click "Publish" to apply the rules
4. Test your application to ensure rules work correctly

## Notes

- All write operations require authentication (`auth != null`)
- Read operations are public for easier access (adjust based on your needs)
- Input validation ensures data integrity
- Phone numbers are validated with regex pattern
- Stock values must be non-negative numbers
- Purchase values must be non-negative numbers

