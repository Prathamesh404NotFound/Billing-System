# Billing System

A comprehensive, modern billing system built with React, TypeScript, and Firebase for managing retail operations, inventory, and customer transactions.

## Features

### 📊 Dashboard
- **Real-time Statistics**: View total bills, today's sales, total items, and total revenue
- **Quick Actions**: Fast access to all major features
- **Recent Bills**: Display of the 5 most recent bills with key information
- **Visual Analytics**: Color-coded stat cards for easy monitoring

### 🧾 Bill Management

#### Make Bill
- **Category-based Item Selection**: Browse items organized by categories
- **Item Variants**: Support for multiple sizes per item
- **Dynamic Bill Summary**: Real-time calculation of subtotal, discount, and total
- **Discount Options**: 
  - Fixed amount discounts
  - Percentage-based discounts
- **Multiple Payment Modes**: 
  - Cash
  - UPI
  - Card
- **Customer Information**: Optional customer name tracking
- **Bill Preview**: View bill details before saving
- **Print Functionality**: Print bills directly from the application

#### View Bills
- **Advanced Search**: Search bills by Bill ID or customer name
- **Date Range Filtering**: Filter bills by start and end dates
- **Bill Details Modal**: View complete bill information including all items
- **Print Bills**: Print individual bills with formatted receipts
- **WhatsApp Sharing**: Share bill details via WhatsApp
- **Payment Mode Indicators**: Visual badges showing payment method
- **Responsive Table**: Easy-to-read table layout with all bill information

### 📦 Item Management
- **Add/Edit Items**: Full CRUD operations for items
- **Category Organization**: Items organized by categories and subcategories
- **Multiple Variants**: Support for multiple sizes per item
- **Search Functionality**: Quick search by item name or subcategory
- **Category Filtering**: Filter items by category
- **Dual View Modes**: 
  - Table view for detailed information
  - Card view for visual browsing
- **Item Descriptions**: Optional descriptions for items
- **Bulk Management**: Easy management of large item catalogs

### 🏷️ Categories Management
- **Category CRUD**: Create, read, update, and delete categories
- **Icon Support**: Add emoji icons to categories for better visual identification
- **Category Organization**: Organize products into logical groups
- **Simple Interface**: Clean, intuitive category management

### ✂️ Alterations Tracking
- **Alteration Records**: Track cloth alteration jobs
- **Customer Information**: Store customer name and contact number
- **Garment Details**: Record garment descriptions and measurements
- **Due Date Tracking**: Set and track completion due dates
- **Status Management**: Mark alterations as completed or pending
- **Notes Field**: Additional notes for special instructions
- **Visual Status Indicators**: Color-coded status (pending/completed)
- **Sorting**: Automatic sorting with pending items first

### ⚙️ Settings
- **Shop Information**: Configure shop name, address, and contact details
- **WhatsApp Integration**: Set WhatsApp number for sharing
- **Logo Upload**: Custom shop logo support
- **Default Discount**: Set default discount values
- **Theme Customization**: Light/Dark theme support
- **Accent Color**: Customize accent colors

### 🎨 User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, modern interface built with Tailwind CSS
- **Dark Mode Support**: Theme switching capability
- **Toast Notifications**: User-friendly notifications for actions
- **Modal Dialogs**: Intuitive modal interfaces for forms and details
- **Sidebar Navigation**: Easy navigation between features
- **Mobile Navigation**: Bottom navigation for mobile devices
- **Error Handling**: Comprehensive error boundaries and handling

### 🔧 Technical Features
- **Firebase Integration**: Real-time database synchronization
- **TypeScript**: Full type safety throughout the application
- **React Context API**: Centralized state management
- **Real-time Updates**: Automatic data synchronization
- **Data Persistence**: All data stored in Firebase
- **Optimistic Updates**: Fast UI updates with background sync

### 📱 Additional Features
- **Bill Printing**: Professional bill printing with formatted layout
- **WhatsApp Integration**: Direct sharing to WhatsApp
- **Search & Filter**: Advanced filtering across all modules
- **Data Validation**: Input validation and error handling
- **Confirmation Dialogs**: Safety confirmations for destructive actions
- **Empty States**: Helpful messages when no data is available

## Technology Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Build Tool**: Vite
- **Routing**: Wouter
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Set up your Firebase project
   - Add Firebase configuration to `src/lib/firebase.ts`

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── data/          # Mock data and constants
├── hooks/         # Custom React hooks
├── lib/           # Utilities and Firebase config
├── pages/         # Main application pages
└── types/         # TypeScript type definitions
```

## Key Pages

- **Dashboard** (`/`) - Overview and statistics
- **Make Bill** (`/make-bill`) - Create new bills
- **View Bills** (`/view-bills`) - Browse and manage bills
- **Items** (`/items`) - Item management
- **Categories** (`/categories`) - Category management
- **Alterations** (`/alterations`) - Track alteration jobs
- **Settings** (`/settings`) - Application settings

---

Built with ❤️ for efficient retail management
