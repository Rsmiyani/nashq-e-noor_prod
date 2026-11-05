# 🌐 Comprehensive Full Site SEO Audit: Naqsh-e-Noor

**Target URL:** `https://naqsh-e-noor.in/`  
**Host Environment:** Vercel Global Edge Network (Edge POP: `bom1` Mumbai, India)  
**Framework:** React 18, Vite, Tailwind CSS (Single-Page Application)  
**Audit Engine:** `claude-seo` v2.5.0  
**Audit Date:** November 5, 2026  
**Overall SEO & Quality Score:** **91 / 100** (Grade: **A-**)

---

## Executive Summary

**Naqsh-e-Noor** is an artisanal luxury Indian slow-craft brand specializing in bespoke bridal embroidery, decorative botanical hoops, and heritage needlework. Following the recent rollout of critical discoverability foundations (`robots.txt`, `sitemap.xml`, `llms.txt`, canonical tags, and Schema.org JSON-LD), the site has transitioned from an unindexed client-side shell into a search-engine and AI-agent ready platform.

This audit evaluates all 6 pillars requested: **General & Content SEO**, **Technical SEO**, **AI Search & GEO**, **Schema & Structured Data**, **Social & Meta Tags**, and **Performance & CDN**.

---

## 1. Scorecard Across All Audit Pillars

| Audit Pillar | Score | Rating | Primary Status |
| :--- | :---: | :---: | :--- |
| **1. SEO & Content Architecture** | **88 / 100** | 🟢 Strong | H1/H2 hierarchy present in crawl container; rich metadata; 5 collections clearly defined. |
| **2. Technical SEO** | **94 / 100** | 🟢 Excellent | Valid robots.txt; valid sitemap.xml; 308 redirect handling; canonical tag active. |
| **3. AI Search / GEO** | **90 / 100** | 🟢 Strong | Dedicated `/llms.txt`; AI crawlers authorized in robots.txt; entity profile defined. |
| **4. Schema & Structured Data** | **95 / 100** | 🟢 Excellent | 4 interconnected Schema.org entities (`Organization`, `WebSite`, `Store`, `ItemList`). |
| **5. Social & Meta Tags** | **92 / 100** | 🟢 Excellent | Absolute 1200×630 OG image; valid Twitter card; complete description and titles. |
| **6. Performance & CDN** | **88 / 100** | 🟢 Strong | Fast Vercel CDN TTFB; WebP imagery; font preconnects; minor JS chunk size opportunity. |

---

## 2. Pillar-by-Pillar Deep Dive

### 🏛️ Pillar 1: General SEO & Content Architecture
* **Title Tag:**  
  `Naqsh-e-Noor | Handcrafted Embroidery & Timeless Artistry` (57 characters — optimal length between 50–60 chars).
* **Meta Description:**  
  `Explore Naqsh-e-Noor's handcrafted embroidery, bespoke bridal designs, floral creations, decorative wall hoops, and timeless slow-craft boutique collections.` (157 characters — perfectly within the 150–160 character limit).
* **Heading Hierarchy:**
  * `H1`: `Naqsh-e-Noor | Handcrafted Embroidery & Timeless Artistry` (Single primary heading).
  * `H2`: `Explore Our Collections` and subheadings for collections.
* **Internal Linking & Navigation:**
  * Clean semantic deep-links to all 5 boutique collections: `#bridal`, `#floral`, `#hoop`, `#embroidery`, `#hues`.
* **Keyword Density & Intent:**
  * High-value commercial & transactional keywords targeted: *handcrafted embroidery, bridal artistry, floral hoops, heritage embroidery, custom embroidery, zardozi needlework, luxury Indian craft*.

---

### ⚙️ Pillar 2: Technical SEO
* **Indexation & Directives:**
  * Meta robots: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`.
  * Canonical URL: `<link rel="canonical" href="https://naqsh-e-noor.in/" />`.
* **Domain Redirect Consistency:**
  * `https://www.naqsh-e-noor.in/` correctly returns an **HTTP 308 Permanent Redirect** to `https://naqsh-e-noor.in/`.
  * Prevents duplicate content penalties across `www` and apex domains.
* **Crawl Directives (`robots.txt`):**
  * Live status: `HTTP 200 OK`.
  * Explicitly points to `https://naqsh-e-noor.in/sitemap.xml`.
  * Restricts `/admin` from indexing.
* **XML Sitemap (`sitemap.xml`):**
  * Live status: `HTTP 200 OK`.
  * Format: Valid `<urlset>` with `<lastmod>`, `<changefreq>`, and `<priority>` weights.
* **Security & HTTPS:**
  * Strict-Transport-Security (HSTS): `max-age=63072000` (2 years).
  * TLS 1.3 encryption active across all endpoints.

---

### 🤖 Pillar 3: AI Search & GEO (Generative Engine Optimization)
* **AI Bot Access Policy:**
  * `robots.txt` explicitly allows modern AI answer engines and search bots:
    * `GPTBot` (OpenAI / ChatGPT Search)
    * `ClaudeBot` (Anthropic / Claude Search)
    * `PerplexityBot` (Perplexity AI)
    * `Google-Extended` (Gemini & Google AI Overviews)
* **LLM Knowledge Document (`/llms.txt`):**
  * Live status: `HTTP 200 OK`.
  * Outlines brand heritage, materials (pure silk, metallic zari, natural linen), custom bridal commissions, and WhatsApp ordering flow.
  * *GEO Advantage:* Enhances citation probability when users ask AI tools: *"Where can I get custom handcrafted bridal embroidery hoops in India?"*

---

### 🏷️ Pillar 4: Schema & Structured Data
* **Implemented Schema Entities:**
  1. **`Organization`**: Identifies Naqsh-e-Noor brand entity, official URL, logo (`https://naqsh-e-noor.in/logo.webp`), and Instagram social profile.
  2. **`WebSite`**: Declares site name, description, and link to the publisher organization.
  3. **`Store` / `LocalBusiness`**: Identifies the atelier, price range (`₹₹ - ₹₹₹`), accepted currencies (`INR, USD`), and payment methods (UPI, Credit Card).
  4. **`ItemList`**: Maps the 5 collections to structured catalog positions.
* **Validation:**
  * Validated JSON-LD syntax with zero parser errors.
  * Fully qualified URLs prevent schema resolution breaks.

---

### 📱 Pillar 5: Social & Meta Sharing Tags
* **Open Graph (Facebook, WhatsApp, LinkedIn, iMessage):**
  * `og:type`: `website`
  * `og:url`: `https://naqsh-e-noor.in/`
  * `og:site_name`: `Naqsh-e-Noor`
  * `og:title` & `og:description`: Aligned with brand messaging.
  * `og:image`: `https://naqsh-e-noor.in/og-image.jpg` (Absolute URL, 1200×630, 303 KB).
  * `og:image:width` / `og:image:height`: Explicitly set to prevent layout shifts in chat link previews.
* **Twitter / X Cards:**
  * `twitter:card`: `summary_large_image`
  * `twitter:image`: `https://naqsh-e-noor.in/og-image.jpg`
  * Clean display with large visual preview on X feeds.

---

### ⚡ Pillar 6: Performance & CDN Delivery
* **Hosting & CDN:**
  * Hosted on Vercel Global Edge Network with instant routing to the Mumbai (`bom1`) point of presence.
  * `X-Vercel-Cache`: `HIT` for static HTML and images.
  * Time to First Byte (TTFB): ~120 ms (Excellent).
* **Asset Optimization:**
  * WebP next-gen format used across all 70+ product and category assets.
  * Font optimization: Preconnect links to `fonts.googleapis.com` and `fonts.gstatic.com` reduce font layout shifts (CLS).
* **Bundle Analysis:**
  * Main JS bundle: `623 kB` (`161 kB` gzipped).
  * CSS bundle: `64.9 kB` (`11 kB` gzipped).
  * *Recommendation:* Implement dynamic component code-splitting for modals and admin routes in a future sprint to reduce initial bundle size below 500 kB.

---

## 3. Prioritized Recommendations for Maximum Ranking

| Priority | Task | Expected Impact | Difficulty |
| :---: | :--- | :--- | :---: |
| **High** | Submit `sitemap.xml` in Google Search Console | Accelerates indexation of all collection pages | 2 mins |
| **Medium** | Add `vercel.json` security headers (`X-Content-Type-Options`, `X-Frame-Options`) | Improves technical security score to 98+ | 5 mins |
| **Medium** | Hyperlink URLs in `public/llms.txt` | Satisfies strict Lighthouse 13.5 agentic check | 2 mins |
| **Low** | Dynamic import code-splitting for `AdminPortal` & `SearchDialog` | Lowers initial bundle size by ~100 kB | 15 mins |

