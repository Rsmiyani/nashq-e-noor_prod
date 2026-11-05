# Full SEO & AI-Search (GEO) Audit Report

**Target Domain:** `https://naqsh-e-noor.in/` (Redirect from `https://www.naqsh-e-noor.in/`)  
**Audit Date:** November 5, 2026  
**Auditor Engine:** Claude-SEO v2.5.0 (Technical, Content, Schema, AI-Agentic, Performance)  
**Overall SEO Health Score:** **54 / 100** (High potential, immediate critical fixes needed)

---

## Executive Summary

**Naqsh-e-Noor** is an artisanal luxury brand specializing in handcrafted embroidery, bridal creations, floral art, and decorative hoops. While the visual aesthetic and frontend stack (Vite + React + Tailwind + Vercel) are modern and fast, the site currently suffers from **critical search engine and AI crawler blind spots**:

1. **No `robots.txt` or `sitemap.xml`** (both return `HTTP 404`). Search engines have no index map.
2. **Pure Client-Side Rendering (CSR)**: The raw HTML delivered to search bots contains only 7 words (`<div id="root"></div>`), resulting in a **thin-content** penalty on non-JS or delayed-rendering crawlers.
3. **Zero Structured Data (Schema.org)**: Missing `Organization`, `Store`, `Product`, `AggregateRating`, and `BreadcrumbList` schemas.
4. **Social Sharing Metadata Bug**: `og:image` is configured with a relative URL (`/assets/detail.webp`), causing broken rich previews on WhatsApp, Twitter/X, and Facebook.
5. **Missing Canonical Tag**: `www` redirects to non-www via 308, but no `<link rel="canonical">` exists to solidify ranking authority.

---

## Scorecard by Category

| Category | Score | Status | Primary Impact |
| :--- | :---: | :---: | :--- |
| **Crawlability & Indexing** | **30 / 100** | 🔴 Critical | Missing `sitemap.xml` and `robots.txt` prevents effective discovery. |
| **Technical SEO & HTML** | **55 / 100** | 🟡 Needs Work | Missing canonical tag, Twitter meta attribute mismatch, relative OG image. |
| **Content & Rendering** | **45 / 100** | 🔴 Critical | Raw HTML contains 7 words; crawlers with low JS budgets see blank content. |
| **Structured Data (Schema)** | **0 / 100** | 🔴 Critical | Zero Schema.org JSON-LD blocks found. Cannot trigger Google Rich Snippets. |
| **AI Search Readiness (GEO)** | **40 / 100** | 🟡 Needs Work | Missing `/llms.txt`, no entity graph for LLM citation (Perplexity, ChatGPT). |
| **Performance & Hosting** | **88 / 100** | 🟢 Good | Hosted on Vercel CDN (`bom1`), HTTP/2, fast TTFB, modern WebP images. |

---

## Detailed Findings & Diagnostic Evidence

### 1. Crawlability & Indexability
* **`robots.txt` Status: `404 Not Found`**
  * *Evidence:* `curl -ILs https://naqsh-e-noor.in/robots.txt` returns `HTTP 404`.
  * *Risk:* Without `robots.txt`, search bots cannot locate the XML sitemap, and AI scrapers lack clear crawler directives.
* **`sitemap.xml` Status: `404 Not Found`**
  * *Evidence:* `sitemap_discovery.py` probed common paths (`sitemap.xml`, `sitemap_index.xml`), all returned 404.
  * *Risk:* Google cannot discover deep collection routes or new product additions.

### 2. On-Page HTML & Meta Tags
* **Missing Canonical URL:**
  * *Current:* `<link rel="canonical" ... />` is absent in `index.html`.
  * *Fix:* Must explicitly define `<link rel="canonical" href="https://naqsh-e-noor.in/" />`.
* **Social Graph / WhatsApp Sharing Broken:**
  * *Current:* `<meta property="og:image" content="/assets/detail.webp" />`.
  * *Issue:* Social platforms require absolute URLs (`https://naqsh-e-noor.in/og-image.jpg`).
* **Twitter Card Meta Tag Attribute:**
  * *Current:* `<meta property="twitter:card" content="summary_large_image" />`.
  * *Standard:* Twitter specification requires `name="twitter:card"`, `name="twitter:title"`, etc., not `property`.

### 3. Rendering & Content Visibility (CSR Issue)
* **Pre-rendering Gap:**
  * Because Vite React mounts into `<div id="root"></div>`, raw HTML output has:
    * `word_count`: 7
    * `h1`: 0 tags
    * `h2`: 0 tags
    * `h3`: 0 tags
  * *Impact:* Lightweight crawlers, WhatsApp preview generators, and AI answer engines do not execute full JavaScript bundles, seeing a blank website.

### 4. Structured Data (Schema.org)
* **Detected Blocks:** 0 blocks.
* **Missing Opportunities:**
  * **Brand / LocalBusiness / Store:** Identifies Naqsh-e-Noor as an authentic handcrafted embroidery studio.
  * **Product & Offer Catalog:** Allows Google Shopping and Search to display collection highlights.
  * **AggregateRating:** You have active reviews and ratings in `RatingsSection.tsx`, but none are communicated to Google's rich result engine.

### 5. Generative Engine Optimization (GEO) & AI Search
* **`llms.txt`:** Returns `404`. Adding `/llms.txt` informs AI engines (Perplexity, Claude, ChatGPT, Gemini) with curated context about artisanal embroidery techniques, bridal wear customization, pricing, and contact options.

