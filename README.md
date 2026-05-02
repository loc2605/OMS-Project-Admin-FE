# ShopModern Admin Management System

This is a premium administrative dashboard designed specifically for the ShopModern ecosystem. It provides a sophisticated and efficient interface for managing products, orders, and customer data with a focus on high-end aesthetics and modern user experience.

## Overview

ShopModern Admin is built to integrate seamlessly with the OMS Microservices architecture. It offers a centralized command center for administrators to monitor business health, handle logistics, and maintain the product catalog.

## Core Technologies

- Frontend Framework: React (Vite)
- Routing: React Router DOM
- State Management: React Hooks
- Styling: Vanilla CSS with Global Variables
- Animations: Framer Motion
- Table Management: TanStack Table (React Table)
- Icons: Lucide React
- Form Handling: React Hook Form
- Validation: Zod
- API Client: Axios
- Notifications: Sonner

## Key Features

- Professional Authentication: Secure login interface with robust validation and premium glassmorphism design.
- Centralized Dashboard: Real-time overview of total revenue, new customers, successful orders, and conversion rates.
- Advanced Product Management: Full CRUD operations for the product catalog, including inventory tracking and status management.
- Order Control Center: Comprehensive tracking of customer orders with status updates and detailed filtering.
- Dynamic Interface: Responsive sidebar with a modern floating toggle and smooth layout transitions.
- Theme Support: Fully integrated dark and light modes using the brand's signature color palette.

## Project Structure

- src/api: Centralized Axios configuration and interceptors for API Gateway integration.
- src/components/common: Reusable UI components such as Button, Input, and specialized Data Tables.
- src/components/layout: Structural components including the Sidebar and Navbar.
- src/layouts: Master layout wrappers that manage the application's overall structure.
- src/pages: Individual feature pages for the Dashboard, Products, Orders, and Authentication.
- src/services: Abstracted API service layers that communicate with Identity, Product, and Order microservices.
- src/utils: Formatting and helper utilities for data consistency.

## Design System

The system utilizes a custom design language inspired by modern premium interfaces:

- Typography: Manrope (Weights 300 to 800)
- Spacing: Optimized for high-density information display while maintaining readability.

## Getting Started

1. Install dependencies:
   npm install

2. Configure environment:
   Update the API Gateway URL in src/api/axios.js if necessary (Default: http://localhost:8888).

3. Run in development mode:
   npm run dev

4. Build for production:
   npm run build

## API Integration

The system is configured to communicate with the OMS API Gateway. It supports the following microservices:
- Identity Service (Auth)
- Product Service (Catalog Management)
- Inventory Service (Stock tracking)
- Order Service (Fulfillment)
- Payment Service (Transaction status)
