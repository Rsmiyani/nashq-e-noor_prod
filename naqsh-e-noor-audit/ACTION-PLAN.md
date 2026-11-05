# Naqsh-e-Noor SEO Action Plan & Implementation Guide

This plan breaks down fixes into 4 prioritized phases.

---

## Phase 1: Immediate Critical Fixes (Day 1)

### 1. Create `public/robots.txt`
Place directly in `d:\projects\nashq-e-noor\public\robots.txt`:
```text
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://naqsh-e-noor.in/sitemap.xml
```

### 2. Create `public/sitemap.xml`
Place in `d:\projects\nashq-e-noor\public\sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://naqsh-e-noor.in/</loc>
    <lastmod>2026-11-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://naqsh-e-noor.in/#bridal</loc>
    <lastmod>2026-11-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://naqsh-e-noor.in/#floral</loc>
    <lastmod>2026-11-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://naqsh-e-noor.in/#hoop</loc>
    <lastmod>2026-11-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://naqsh-e-noor.in/#embroidery</loc>
    <lastmod>2026-11-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://naqsh-e-noor.in/#hues</loc>
    <lastmod>2026-11-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### 3. Update `index.html` with Meta Tags & Canonical
- Add canonical: `<link rel="canonical" href="https://naqsh-e-noor.in/" />`
- Use absolute URL for `og:image`: `https://naqsh-e-noor.in/og-image.jpg`
- Fix Twitter attributes (`name` instead of `property`)

---

## Phase 2: Schema.org JSON-LD Structured Data (Week 1)

Embed JSON-LD in `index.html` inside `<head>`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://naqsh-e-noor.in/#organization",
      "name": "Naqsh-e-Noor",
      "url": "https://naqsh-e-noor.in/",
      "logo": "https://naqsh-e-noor.in/assets/logo.webp",
      "description": "Handcrafted luxury embroidery, bridal artistry, floral hoops, and heritage needlework boutique.",
      "sameAs": [
        "https://www.instagram.com/naqsh_e_noor/"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://naqsh-e-noor.in/#website",
      "url": "https://naqsh-e-noor.in/",
      "name": "Naqsh-e-Noor",
      "publisher": {
        "@id": "https://naqsh-e-noor.in/#organization"
      }
    },
    {
      "@type": "Store",
      "@id": "https://naqsh-e-noor.in/#store",
      "name": "Naqsh-e-Noor Studio",
      "url": "https://naqsh-e-noor.in/",
      "image": "https://naqsh-e-noor.in/og-image.jpg",
      "description": "Exclusive bespoke embroidery atelier specializing in bridal wear and decorative art.",
      "priceRange": "$$$"
    }
  ]
}
</script>
```

---

## Phase 3: AI Search Readiness & `llms.txt` (Week 2)

Create `public/llms.txt`:
```markdown
# Naqsh-e-Noor

> Luxury handcrafted embroidery, bespoke bridal artistry, and decorative botanical hoops.

## About
Naqsh-e-Noor is an artisanal embroidery studio celebrating slow craft, fine needlework, and heritage Indian embroidery techniques.

## Core Collections
- **Bridal Collection**: Intricate zardozi, metallic thread work, and bridal trousseau motifs.
- **Floral Collection**: Botanical needle art with organic pastel palettes.
- **Hoop Collection**: Framed artisan linen wall hoops for interior design.
- **Embroidery Collection**: Slow craft statement pieces with traditional stitches.
- **Hues Collection**: Rich pigments and gradient embroidery work.

## Ordering & Inquiries
- Website: https://naqsh-e-noor.in/
- WhatsApp / Direct Custom Orders available via site inquiry.
```

---

## Phase 4: Crawl & Index Optimization (Ongoing)

1. **Fallback Content in HTML (`<noscript>` & SEO crawl container):**
   Add semantic semantic headings (`<h1>`, `<h2>`) and brand summary inside `index.html` within a `<noscript>` tag or static pre-render container so search bots instantly parse the 5 collections even before JS loads.
2. **Google Search Console Verification:**
   Add Google site verification tag to `index.html` and submit `https://naqsh-e-noor.in/sitemap.xml`.

