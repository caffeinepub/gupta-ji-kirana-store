# Specification

## Summary
**Goal:** Build a customer-facing ecommerce website for “Gupta ji kirana store” with a complete shopping flow, plus an admin interface and a Motoko backend that persists products and orders.

**Planned changes:**
- Create storefront pages: Home/Shop (search + category filter), Product Details, Cart, Checkout, and Orders.
- Implement cart interactions: add/update quantity/remove items and show cart item count in navigation.
- Add Internet Identity sign-in and require authentication for placing orders and viewing order history (browsing remains public).
- Build admin pages to create/edit/delete products and categories, and to view all incoming orders (restricted by backend allowlist).
- Implement backend models/APIs for categories, products (list + by ID), order creation from cart line items, and order retrieval (per user and admin list), with stable storage in a single Motoko actor.
- Seed demo catalog data on first run (~20 common kirana items across multiple categories).
- Apply a cohesive kirana-store visual theme (not blue+purple) across layout/components and add required static generated images (logo, hero banner, category icons), including favicon/app icon where applicable.

**User-visible outcome:** Users can browse a seeded kirana catalog, view product details, manage a cart, sign in with Internet Identity to checkout and see past orders with confirmations and order IDs; authorized admins can manage products/categories and review all orders.
