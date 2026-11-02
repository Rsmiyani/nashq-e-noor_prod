# Naqsh-e-Noor — Luxury Heritage Boutique Website

An inquiry-based, luxury heritage boutique catalog website crafted for **Naqsh-e-Noor**, showcasing handcrafted embroidery, bridal artistry, decorative hoops, and bespoke lifestyle products.

---

## 1. Overview & Brand Identity

- **Brand Name:** Naqsh-e-Noor
- **Industry:** Handcrafted Embroidery, Bridal Artistry, Decorative Hoops, Floral Needlework, and Boutique Lifestyle Products
- **Website Type:** Premium Product Catalog + WhatsApp Direct Inquiry Flow
- **WhatsApp Phone:** `+91 95017 67133`
- **WhatsApp URL:** `https://wa.me/919501767133`
- **Instagram:** `https://www.instagram.com/naqsh_e_noor7/`
- **Tagline:** *"Timeless Artistry, Thoughtfully Handcrafted."*

---

## 2. Design System & Tokens

### Color Palette
- **Warm Ivory (`#F7F0E2`):** Primary page background & generous breathing room.
- **Champagne Beige (`#E8D9BD` / `#F4ECE0`):** Alternate sections & subtle frames.
- **Antique Gold (`#9D7B3F` / `#846733`):** Action buttons, badges, dividers & accents.
- **Deep Espresso (`#403323` / `#2A2117`):** Primary headings, dark accents & contrast text.
- **Muted Sage (`#68715B`):** Botanical accents & natural highlights.
- **Soft Cream (`#FBF8F1`):** Product cards & modal surface background.
- **Muted Brown (`#756956`):** Secondary descriptions & captions.

### Typography
- **Headings & Display:** `Cormorant Garamond` (Weights 400, 500, 600, Italic)
- **Body & Interface:** `Manrope` (Weights 400, 500, 600, 700)

---

## 3. Asset Integrity & Catalog Data

All **124** original studio and bespoke images are dynamically imported and rendered without duplication or distortion:

```text
assets/
├── logo.webp                       (Original logo, uncropped)
├── detail.webp                     (Craftsmanship close-up)
├── teal.webp                       (Editorial floral embroidery art)
├── hero-slide-1-artisan.jpg        (Bespoke Slide 1: Artisan with floral hoop & dark negative space)
├── hero-slide-2-bridal.jpg         (Bespoke Slide 2: Royal bridal crimson & zardozi needlework)
├── hero-slide-3-floral.jpg         (Bespoke Slide 3: Handcrafted wooden floral hoops & dimensional threads)
└── categories/
    ├── bridal/                     (14 images -> BRD-001 to BRD-014)
    ├── embroidery/                 (27 images -> EMB-001 to EMB-027)
    ├── floral/                     (35 images -> FLR-001 to FLR-035)
    ├── hoop/                       (18 images -> HOP-001 to HOP-018)
    └── hues/                       (24 images -> HUE-001 to HUE-024)
```

**Total catalog products:** **118**  
**Total original root assets:** **3**  
**Bespoke editorial hero banners:** **3**

---

## 4. Key Architectural Features

1. **Editorial Hero Section with Bespoke AI Visual:**
   - Designed following the high-contrast luxury layout with negative space on the left and handcrafted artistry on the right.
   - Dual badge system (`[ HANDCRAFTED HERITAGE ]`, `[ TIMELESS ATELIER ]`).
   - 3-slide crossfade carousel featuring the generated atelier banner, `detail.webp`, and `teal.webp`.
   - Autoplay (6-second intervals), pause on hover, touch gestures, and keyboard controls.

2. **Complete Product Catalog & Filters:**
   - Real-time search by Product ID (`BRD-001`, etc.) or keyword.
   - Category filtering with live counts.
   - Sorting by Curated Selection or Product ID (Ascending/Descending).
   - Smooth skeleton loading placeholders and image error fallbacks.
   - Progressive loading (24 items per batch or "Show All") for mobile optimization.

3. **Interactive Product Detail Experience:**
   - High-resolution view with hover/click **interactive magnifying zoom lens**.
   - URL Hash support (`#product=BRD-001`) enabling direct sharing and refresh persistence.
   - Quick "Copy Link" with clipboard feedback.
   - Related creations from the same collection.

4. **Validated WhatsApp Inquiry Flow:**
   - Direct button on cards, detail views, header, and contact section.
   - Modal collecting customer name (required) and optional customization requirements.
   - Prefills formatted message with Product Name, Product ID, Category, Direct URL link, and Customer notes.
   - Encoded cleanly via `encodeURIComponent()` and dispatched directly to `https://wa.me/919501767133`.

5. **Brand Story & Social Mosaic:**
   - Authentic slow-craftsmanship storytelling.
   - Curated 6-piece Instagram mosaic linking directly to `@naqsh_e_noor7`.
   - General studio inquiry form supporting bespoke commission requests.

---

## 5. Development & Build Instructions

### Prerequisites
- Node.js (v18+)
- npm (or npm.cmd on Windows)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 6. Project Structure

```text
├── assets/                  # Studio images & category directories
├── src/
│   ├── components/
│   │   ├── AnnouncementBar.tsx       # Top notification strip
│   │   ├── Header.tsx                # Sticky navbar & mobile drawer
│   │   ├── HeroSlider.tsx            # Editorial hero slider
│   │   ├── BrandIntro.tsx            # Brand introduction & pillars
│   │   ├── CollectionShowcase.tsx    # 5 curated collection cards
│   │   ├── ProductCatalog.tsx        # Filter, search & responsive grid
│   │   ├── ProductCard.tsx           # Product card with badges & actions
│   │   ├── ProductDetailModal.tsx    # Inspection modal with zoom lens
│   │   ├── InquiryModal.tsx          # WhatsApp prefilled inquiry modal
│   │   ├── BrandStory.tsx            # Philosophy & slow craft narrative
│   │   ├── InstagramShowcase.tsx     # 6-photo social journal
│   │   ├── ContactSection.tsx        # Direct contact cards & general form
│   │   ├── SearchDialog.tsx          # Quick search overlay dialog
│   │   ├── BackToTop.tsx             # Floating smooth back to top button
│   │   └── Footer.tsx                # Heritage styled footer
│   ├── data/
│   │   └── products.ts               # Data registry & Vite asset imports
│   ├── styles/
│   │   └── index.css                 # Tailwind directives & luxury tokens
│   ├── App.tsx                       # Root orchestrator
│   ├── main.tsx                      # DOM entrypoint
│   └── vite-env.d.ts                 # TypeScript declarations
├── index.html                        # Meta tags, SEO, Google Fonts
├── package.json                      # Scripts & dependencies
├── tailwind.config.js                # Custom color tokens & fonts
├── tsconfig.json                     # TypeScript configuration
└── vite.config.ts                    # Vite build configuration
```

