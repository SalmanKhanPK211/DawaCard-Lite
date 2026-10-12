import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export interface SEOProps {
  title?: string;
  titleUr?: string;
  description?: string;
  descriptionUr?: string;
  canonicalPath?: string;
}

const DEFAULT_TITLE = 'DawaCard Lite — AI Medication Manager & Emergency Health Card';
const DEFAULT_TITLE_UR = 'دوا کارڈ لائٹ — اے آئی ادویات کا ریکارڈ اور ایمرجنسی ہیلتھ کارڈ';

const DEFAULT_DESC =
  'Manage daily medications, scan prescriptions with Gemini AI, monitor drug interactions, and generate an emergency medical health card with instant EMT QR access.';
const DEFAULT_DESC_UR =
  'روزانہ کی ادویات کا شیڈول، جیمنائی اے آئی کے ذریعے نسخہ اسکین کرنا، ادویاتی تصادم کی جانچ اور ایمرجنسی کیو آر ہیلتھ کارڈ۔';

const BASE_URL = 'https://dawa-card-lite.vercel.app';

export const SEO: React.FC<SEOProps> = ({
  title,
  titleUr,
  description,
  descriptionUr,
  canonicalPath,
}) => {
  const location = useLocation();
  const { isUrdu } = useLanguage();

  useEffect(() => {
    // 1. Compute dynamic localized title
    let resolvedTitle = '';
    if (isUrdu) {
      resolvedTitle = titleUr
        ? `${titleUr} | دوا کارڈ لائٹ`
        : title
        ? `${title} | دوا کارڈ لائٹ`
        : DEFAULT_TITLE_UR;
    } else {
      resolvedTitle = title ? `${title} | DawaCard Lite` : DEFAULT_TITLE;
    }
    document.title = resolvedTitle;

    // 2. Compute description
    const resolvedDesc = isUrdu
      ? descriptionUr || description || DEFAULT_DESC_UR
      : description || DEFAULT_DESC;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', resolvedDesc);

    // 3. Open Graph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', resolvedTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', resolvedDesc);

    // 4. Canonical URL
    const path = canonicalPath || location.pathname;
    const fullCanonical = `${BASE_URL}${path === '/' ? '' : path}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', fullCanonical);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', fullCanonical);
  }, [title, titleUr, description, descriptionUr, canonicalPath, location.pathname, isUrdu]);

  return null;
};
