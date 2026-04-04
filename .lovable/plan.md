

# ZenPOS Big Upgrade Plan

## Summary
A comprehensive upgrade covering 8 major areas: Store Management Dashboard for owners, Admin Dashboard overhaul with separate layout, mobile/desktop responsive improvements, store page media uploads, Ezo Billing system branding, gallery seeding, theme expansion, and creative feature additions.

---

## What Will Be Built

### 1. Owner Store Management Dashboard (New Page: `/store-manager`)
A dedicated page where owners manage their public store website — separate from Settings.

**Pages/Sections inside Store Manager:**
- **Overview** — live store stats (views, products, reviews)
- **Appearance** — theme picker (8+ expo themes per category), banner/hero image upload, logo, colors
- **Pages** — manage Home, About, Contact content
- **Media** — drag-and-drop image/video/banner upload gallery (new `store_media` table)
- **Products** — quick toggle visibility, reorder products on store
- **Reviews** — approve/reject with bulk actions
- **SEO** — store title, description, social links

### 2. Admin Dashboard — Separate Layout (No BottomNav)
Admin gets its own sidebar-based layout at `/admin/*` routes:
- `/admin` — Overview with charts
- `/admin/gallery` — Gallery management
- `/admin/stores` — All stores with category filter + feature toggle button
- `/admin/users` — User management
- `/admin/smtp` — SMTP/Cloud email config
- `/admin/alerts` — Broadcast notifications
- `/admin/features` — Category feature matrix
- `/admin/analytics` — Revenue, growth charts
- `/admin/subscriptions` — Plan management

**Special "Super Control" button**: floating action button that lets admin quickly enable/disable features for any store.

### 3. Mobile & Desktop Layout Differentiation
- **Mobile**: Bottom nav (4 buttons), compact cards, swipe gestures, cart-on-top billing
- **Desktop**: Left sidebar nav (expanded with labels), wider content area, split-panel billing
- Workspace: product grid 2-col on mobile, 3-col on desktop with list/grid toggle
- All pages get proper `lg:pl-24` desktop padding and responsive breakpoints

### 4. Store Page Upgrade — Owner Media Uploads
**Database changes:**
```sql
CREATE TABLE store_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  media_type text NOT NULL DEFAULT 'image', -- image, video, banner
  url text NOT NULL,
  title text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
-- RLS: owner can CRUD own media, public can SELECT active media
```

**Store page enhancements:**
- Hero banner slideshow from owner-uploaded banners
- Video section (YouTube/uploaded)
- Image gallery section
- Offers section showing active business_offers
- "About Us" section with owner-editable content

### 5. Ezo Billing System Branding
- Rename billing header to "Ezo POS" with branded logo
- Add "Ezo Admin" branding on admin dashboard header
- Receipt/invoice branding with "Powered by Ezo"
- Splash animation on billing page load

### 6. Gallery Products — Database Seeding
Insert 100+ products across all 13 categories into `gallery_products` table via insert tool. Each category gets 8-10 products with proper brand names, images (Unsplash URLs), SKUs, and tax rates.

### 7. Expo Store Themes (8 themes per category type)
Expand `STORE_THEMES` to include category-aware expo themes:
- **Car Wash**: Midnight Blue, Aqua Splash, Carbon Dark, Ice White
- **Grocery**: Fresh Green, Market Orange, Farm Brown, Clean White  
- **Medical**: Hospital White, Pharma Blue, Health Green, Emergency Red
- **Café**: Espresso Dark, Cream Light, Mocha Warm, Mint Fresh
- And 4 unique themes for each remaining category

Each theme defines: hero gradient, card style, font weight, button style, nav color, footer pattern, accent colors.

### 8. Creative Feature Suggestions
- **Quick Stats Widget** on dashboard — animated counter cards
- **Product Bulk Import** — CSV upload in workspace
- **Inventory Alerts** — low stock badges + toast notifications
- **Daily Summary Card** — auto-generated daily report card on dashboard
- **Customer Loyalty Points** — simple point system per purchase
- **WhatsApp Quick Share** — one-tap bill share via WhatsApp
- **QR Code for Store** — generate store QR code in settings
- **Multi-language Ready** — i18n structure for Hindi/English toggle

---

## Technical Approach

### Files to Create
- `src/pages/StoreManager.tsx` — Owner store management dashboard
- `src/components/admin/AdminLayout.tsx` — Sidebar layout for admin
- `src/components/store/MediaUploader.tsx` — Drag-and-drop media component
- `src/components/store/ThemePicker.tsx` — Expo theme selector

### Files to Modify
- `src/App.tsx` — Add `/store-manager` and `/admin/*` routes
- `src/pages/AdminDashboard.tsx` — Refactor into sidebar layout with separate pages
- `src/pages/StorePage.tsx` — Add media gallery, offers, video sections
- `src/pages/SettingsPage.tsx` — Replace "Store" panel with link to Store Manager
- `src/pages/Billing.tsx` — Ezo branding, improved mobile UX
- `src/pages/Workspace.tsx` — Grid/list toggle, bulk actions
- `src/pages/Dashboard.tsx` — Quick stats widgets, daily summary
- `src/components/layout/BottomNav.tsx` — Keep 4 buttons, improve active states
- `src/lib/categoryConfig.ts` — Add expo themes config

### Database Migrations
1. `store_media` table with RLS
2. `store_content` table (for About Us, custom text sections) with RLS
3. Insert 100+ gallery products across all categories

### No OTP/Phone Auth
Email + password only. No mobile number OTP verification.

