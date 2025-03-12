# Sales & Inventory Management System
![Screenshot 2025-03-12 102126](https://github.com/user-attachments/assets/34e7a75a-bde0-418c-9950-5546da9a2cca)

## Project Documentation

### 1. Project Overview

The Sales & Inventory Management System is a client-side web application built with Next.js that allows businesses to manage their inventory and track sales without requiring a database. All data is stored in the browser's local storage, making it ideal for small businesses or situations where setting up a database is not feasible.

### 2. Key Features

- **User Authentication**: Login system with role-based access control (admin and sales roles)
- **Dashboard**: Overview of key metrics including total products, sales, revenue, and low stock alerts
- **Product Management**: Add, edit, delete, and search products
- **Sales Management**: Record sales, generate invoices, and track sales history
- **Reporting**: Generate and export sales and inventory reports
- **User Management**: Admin can manage system users
- **Data Import/Export**: Import and export data in JSON and CSV formats
- **Settings**: Configure system preferences including dark mode
- **Responsive Design**: Works on desktop and mobile devices

### 3. Technical Architecture

The application is built using:

- **Next.js**: React framework for building the UI
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **shadcn/ui**: Component library
- **Recharts**: For data visualization
- **Local Storage API**: For data persistence

### 4. Installation and Setup

1. **Clone the repository**:

```shell
git clone https://github.com/your-username/sales-inventory-system.git
cd sales-inventory-system
```

2. **Install dependencies**:

```shell
npm install
```

3. **Run the development server**:

```shell
npm run dev
```

4. **Access the application**:
Open [http://localhost:3000](http://localhost:3000) in your browser

### 5. Default Credentials

The system comes with two default user accounts:

- **Admin**: Username: `admin`, Password: `admin123`
- **Sales**: Username: `sales`, Password: `sales123`

### 6. Data Model

#### User

```typescript
type User = {
  id: number;
  username: string;
  password?: string;
  role: "admin" | "sales";
}
```

#### Product

```typescript
type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
}
```

#### Sale

```typescript
type Sale = {
  id: number;
  date: string;
  items: SaleItem[];
  totalPrice: number;
  customerName?: string;
}

type SaleItem = {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}
```

#### Settings

```typescript
type Settings = {
  lowStockThreshold: string;
  companyName: string;
  darkMode: boolean;
}
```

### 7. Module Breakdown

#### Authentication System

- Located in `components/auth-provider.tsx`
- Provides context for user authentication
- Handles login/logout functionality
- Initializes default users and sample data

#### Dashboard

- Located in `app/dashboard/page.tsx`
- Displays key metrics and recent activity
- Shows low stock alerts and recent sales

#### Products Management

- Located in `app/dashboard/products/page.tsx`
- CRUD operations for products
- Search, filter, and sort functionality
- Import/export capabilities

#### Sales Management

- Located in `app/dashboard/sales/page.tsx`
- Record new sales
- Generate invoices
- View sales history

#### Reporting

- Located in `app/dashboard/reports/page.tsx`
- Generate sales and inventory reports
- Data visualization with charts
- Export reports in different formats

#### User Management

- Located in `app/dashboard/users/page.tsx`
- Admin-only access
- CRUD operations for system users

#### Settings

- Located in `app/dashboard/settings/page.tsx`
- Configure system preferences
- Import/export system data
- Reset system

### 8. Local Storage Implementation

The application uses the browser's localStorage API to persist data. The following keys are used:

- `users`: Array of user objects
- `products`: Array of product objects
- `sales`: Array of sale objects
- `settings`: Object containing system settings
- `currentUser`: Object containing the currently logged-in user

### 9. User Roles and Permissions

#### Admin

- Full access to all system features
- Can manage users
- Can access settings
- Can add, edit, and delete products
- Can record sales

#### Sales

- Limited access to system features
- Cannot manage users
- Cannot access settings
- Can view products but cannot add, edit, or delete them
- Can record sales

### 10. Component Structure

```plaintext
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   ├── page.tsx           # Dashboard home page
│   │   ├── products/
│   │   │   └── page.tsx       # Products management
│   │   ├── sales/
│   │   │   └── page.tsx       # Sales management
│   │   ├── reports/
│   │   │   └── page.tsx       # Reports generation
│   │   ├── users/
│   │   │   └── page.tsx       # User management
│   │   └── settings/
│   │       └── page.tsx       # System settings
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Login page
├── components/
│   ├── auth-provider.tsx      # Authentication context
│   ├── login-form.tsx         # Login form
│   ├── new-sale-form.tsx      # Form for recording sales
│   ├── sale-invoice.tsx       # Invoice component
│   ├── sidebar.tsx            # Dashboard sidebar
│   └── ui/                    # UI components
├── lib/
│   └── utils.ts               # Utility functions
```

### 11. Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones

The layout adjusts based on screen size, ensuring a good user experience across devices.

### 12. Printing Support

The application includes print-friendly styles for invoices. When viewing a sale invoice, users can click the "Print" button to generate a printer-friendly version.

### 13. Data Backup and Recovery

Users can:

- Export all data as JSON for backup
- Export specific data (products, sales) as JSON or CSV
- Import data from previously exported files
- Reset the system while preserving user accounts

### 14. Limitations

- Uses local storage, limiting data capacity
- Data is browser-specific
- No real-time collaboration

### 15. Future Enhancements

- Cloud sync, barcode scanning, customer management, advanced reporting
