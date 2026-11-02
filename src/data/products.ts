// Naqsh-e-Noor Luxury Product Catalog & Asset Registry
import logoUrl from '../../assets/logo.webp';
import crestUrl from '../../assets/brand-crest.jpg';
import detailUrl from '../../assets/detail.webp';
import tealUrl from '../../assets/teal.webp';
import heroSlide1Url from '../../assets/hero-slide-1-artisan.jpg';
import heroSlide2Url from '../../assets/hero-slide-2-bridal.jpg';
import heroSlide3Url from '../../assets/hero-slide-3-floral.jpg';

export type CategoryKey = string;

export interface Product {
  id: string; // e.g. BRD-001
  name: string; // e.g. Bridal Design 01
  category: string;
  categoryLabel: string;
  image: string;
  sourceFile: string;
  description: string;
  price: string;
  tags: string[];
  featured?: boolean;
}

export interface CollectionMeta {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  itemCount: number;
}

// Brand root assets
export const brandAssets = {
  logo: crestUrl,
  originalLogo: logoUrl,
  crest: crestUrl,
  detail: detailUrl,
  teal: tealUrl,
  heroSlide1: heroSlide1Url,
  heroSlide2: heroSlide2Url,
  heroSlide3: heroSlide3Url,
};

// Import all category images eagerly via Vite glob
const categoryImageModules = import.meta.glob<string>(
  '../../assets/categories/*/*.webp',
  { eager: true, import: 'default' }
);

interface RawParsedImage {
  category: 'bridal' | 'embroidery' | 'floral' | 'hoop' | 'hues';
  fileName: string;
  url: string;
}

const rawImages: RawParsedImage[] = [];

for (const [path, url] of Object.entries(categoryImageModules)) {
  const match = path.match(/categories\/([^/]+)\/([^/]+)$/);
  if (match) {
    const category = match[1] as RawParsedImage['category'];
    const fileName = match[2];
    rawImages.push({ category, fileName, url });
  }
}

// Natural sort by file name within category
const categoryPrefixMap: Record<'bridal' | 'embroidery' | 'floral' | 'hoop' | 'hues', { prefix: string; label: string }> = {
  bridal: { prefix: 'BRD', label: 'Bridal Collection' },
  embroidery: { prefix: 'EMB', label: 'Embroidery Collection' },
  floral: { prefix: 'FLR', label: 'Floral Collection' },
  hoop: { prefix: 'HOP', label: 'Hoop Collection' },
  hues: { prefix: 'HUE', label: 'Hues Collection' },
};

const categoryDescriptions: Record<'bridal' | 'embroidery' | 'floral' | 'hoop' | 'hues', string> = {
  bridal: 'Opulent handcrafted bridal embroidery crafted for memorable occasions. Each piece weaves heritage motifs, fine metallic threads, and intricate needlework.',
  embroidery: 'Masterpieces of slow craft celebrating traditional Indian embroidery techniques, floral motifs, and timeless elegance.',
  floral: 'Delicate botanical artistry inspired by blooming flowers, garden motifs, and serene pastel palettes rendered in lustrous threads.',
  hoop: 'Artisan wall hoops and decorative keepsakes featuring framed embroidery on premium linen and wooden rings, perfect for luxury interior spaces.',
  hues: 'Celebration of rich pigments, tonal gradients, and harmonious color blends created by layered embroidery craftsmanship.',
};

// Build products list deterministically
const sortedByCategory: Record<string, RawParsedImage[]> = {
  bridal: [],
  embroidery: [],
  floral: [],
  hoop: [],
  hues: [],
};

rawImages.forEach((img) => {
  if (sortedByCategory[img.category]) {
    sortedByCategory[img.category].push(img);
  }
});

// Sort files alphabetically/numerically
Object.keys(sortedByCategory).forEach((cat) => {
  sortedByCategory[cat].sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true }));
});

export const allProducts: Product[] = [];

Object.entries(sortedByCategory).forEach(([catKey, items]) => {
  const category = catKey as 'bridal' | 'embroidery' | 'floral' | 'hoop' | 'hues';
  const { prefix, label } = categoryPrefixMap[category];
  const description = categoryDescriptions[category];

  items.forEach((item, index) => {
    const itemNumber = index + 1;
    const paddedId = `${prefix}-${String(itemNumber).padStart(3, '0')}`;
    const displayName = `${label.replace(' Collection', '')} Design ${String(itemNumber).padStart(2, '0')}`;

    // Mark select designs as featured for spotlight
    const isFeatured = itemNumber === 1 || itemNumber === 5 || (category === 'embroidery' && itemNumber === 3) || (category === 'floral' && itemNumber === 8);

    allProducts.push({
      id: paddedId,
      name: displayName,
      category,
      categoryLabel: label,
      image: item.url,
      sourceFile: item.fileName,
      description: `${description} Handcrafted with pure dedication, delicate threadwork, and bespoke artistry.`,
      price: 'Price available on inquiry',
      tags: ['Handcrafted', 'Bespoke', category.charAt(0).toUpperCase() + category.slice(1)],
      featured: isFeatured,
    });
  });
});

// Collections Metadata with cover images
export const collections: CollectionMeta[] = [
  {
    key: 'bridal',
    title: 'Bridal Collection',
    subtitle: 'Heirloom Bridal Artistry & Zardozi Detailing',
    description: 'Bespoke embroidery pieces designed to elevate auspicious bridal milestones and treasured celebrations.',
    coverImage: allProducts.find((p) => p.id === 'BRD-001')?.image || '',
    itemCount: sortedByCategory.bridal.length,
  },
  {
    key: 'embroidery',
    title: 'Embroidery Collection',
    subtitle: 'Masterful Silk Threadwork & Heritage Motifs',
    description: 'Signature hand embroidery showcasing generational stitches, intricate textures, and timeless grace.',
    coverImage: allProducts.find((p) => p.id === 'EMB-003')?.image || allProducts.find((p) => p.id === 'EMB-001')?.image || '',
    itemCount: sortedByCategory.embroidery.length,
  },
  {
    key: 'floral',
    title: 'Floral Collection',
    subtitle: 'Nature-Inspired Botanicals & Petal Artistry',
    description: 'Lush botanicals and blooming floral tapestries hand-stitched with delicate color gradations.',
    coverImage: allProducts.find((p) => p.id === 'FLR-004')?.image || allProducts.find((p) => p.id === 'FLR-001')?.image || '',
    itemCount: sortedByCategory.floral.length,
  },
  {
    key: 'hoop',
    title: 'Hoop Collection',
    subtitle: 'Decorative Wooden Hoops & Keepsake Frames',
    description: 'Charming circular embroidery hoop art tailored for modern gallery walls, nurseries, and memorable gifts.',
    coverImage: allProducts.find((p) => p.id === 'HOP-001')?.image || '',
    itemCount: sortedByCategory.hoop.length,
  },
  {
    key: 'hues',
    title: 'Hues Collection',
    subtitle: 'Vibrant Tonal Harmonies & Ombre Weaves',
    description: 'A study in chromatic elegance, weaving together rich tonal shifts, vibrant threads, and delicate sheen.',
    coverImage: allProducts.find((p) => p.id === 'HUE-007')?.image || allProducts.find((p) => p.id === 'HUE-001')?.image || '',
    itemCount: sortedByCategory.hues.length,
  },
];

// WhatsApp URL generator helper
export const WHATSAPP_PHONE = '919501767133';
export const WHATSAPP_DISPLAY_PHONE = '+91 95017 67133';
export const INSTAGRAM_URL = 'https://www.instagram.com/naqsh_e_noor7/';
export const INSTAGRAM_HANDLE = '@naqsh_e_noor7';

export function createWhatsAppInquiryUrl(params: {
  customerName: string;
  customerPhone?: string;
  productName: string;
  productId: string;
  category: string;
  message?: string;
  productUrl?: string;
}): string {
  const currentUrl = params.productUrl || window.location.href;
  
  const text = [
    'Hello Naqsh-e-Noor,',
    '',
    'I am interested in one of your handcrafted products.',
    '',
    `Name: ${params.customerName.trim()}`,
    params.customerPhone?.trim() ? `Phone: ${params.customerPhone.trim()}` : null,
    `Product: ${params.productName}`,
    `Product ID: ${params.productId}`,
    `Category: ${params.category}`,
    `Product Link: ${currentUrl}`,
    '',
    'My Requirement:',
    params.message?.trim() || 'Please share the details, pricing, and availability.',
    '',
    'Thank you.',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

export function createGeneralInquiryUrl(params: {
  customerName: string;
  customerPhone?: string;
  inquiryType: string;
  message: string;
}): string {
  const text = [
    'Hello Naqsh-e-Noor,',
    '',
    'I would like to inquire about your handcrafted collections.',
    '',
    `Name: ${params.customerName.trim()}`,
    params.customerPhone?.trim() ? `Phone: ${params.customerPhone.trim()}` : null,
    `Inquiry Type: ${params.inquiryType}`,
    '',
    'Message:',
    params.message.trim() || 'I would like to learn more about your bespoke pieces.',
    '',
    'Thank you.',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

