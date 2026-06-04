# ShopModern Admin Management System

A premium administrative dashboard built for the ShopModern ecosystem. It serves as a centralized management panel for administrators to oversee store activities, control inventory, approve orders, manage user permissions, and query the system using an AI assistant.

---

## 🛠️ Core Technology Stack

- **Framework**: React 19 (Vite-based build system)
- **Routing**: React Router DOM (v7)
- **State & Form Management**: React Hooks, React Hook Form, Zod (Validation Resolver)
- **UI & Animation**: Vanilla CSS (scoped global tokens inside `:root`), Framer Motion (for premium micro-animations and slide transitions), Lucide React (Icons)
- **Data Visualizations**: Custom inline SVG charts (Curved Area charts for revenue analytical graphing)
- **Data Management**: TanStack Table (v8) for high-performance sorting and pagination, XLSX for sheet exporting
- **HTTP Client**: Axios (with custom request/response interceptor pipelines)
- **Notifications**: Sonner

---


## 💎 Page Configurations & Features

### 1. Dynamic Authentication (`pages/LoginPage.jsx`)
- Premium glassmorphic card interface featuring slow-drifting mesh gradient blobs and a subtle grid overlay.
- Secure, validated input fields (User, Lock) with glowing focus borders.
- Uses `sessionStorage` to persist the JWT token (`admin_token`) and user metadata (`admin_user`).

### 2. Analytical Dashboard (`pages/Dashboard.jsx`)
- **Key Metrics Overview**: Real-time revenue trackers, completion counts, order cancellation ratios, and low-stock indicators.
- **Interactive SVG Charting**: Renders a curved revenue Area Chart over a configurable date range with dynamic tooltip overlays on hover.
- **Leaderboards & Warning Center**: Displays top-selling products and itemized low-stock indicators with modal links to restock.
- **RAG AI Chat Playground**: Integrated floating AI Assistant chat widget connecting to a Retrieval-Augmented Generation service with manual Vector DB bootstrap synchronizers.

### 3. Catalog Management (`pages/Products/ProductList.jsx`)
- Full CRUD operations for products (Create, Read, Update, Delete) supporting `multipart/form-data` uploads.
- Category filters, keyword searches, and custom pagination handlers.
- **Excel Exporter**: Export filtered products directly into spreadsheets using XLSX.
- **Stock Adjuster**: Adjust stock levels via `StockAdjustForm` using defined `IMPORT` or `REDUCE` operations.

### 4. Order Control (`pages/Orders/OrderList.jsx`)
- Tabular views of customer orders displaying order detail drop-downs (shipping info, product breakdowns, payment type).
- Filters for payment status (VNPay/COD) and order phases.
- **State Approval**: Transition orders to transit phase using the "Duyệt chuẩn bị hàng" action.

### 5. Account Administration (`pages/Users/UserList.jsx`)
- Lists store accounts with pagination and searches.
- **Moderation Actions**: Instantly Ban/Unban user accounts (toggling status states between `ACTIVE` and `BANNED`), synchronized with back-end identity services.

---


## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment Variables**:
   Create or modify the `.env` file in the root directory:
   ```env
   VITE_API_URL=http://172.20.10.13:8888
   ```

3. **Start the local Vite dev server**:
   ```bash
   npm run dev
   ```

4. **Build production static bundle**:
   ```bash
   npm run build
   ```
