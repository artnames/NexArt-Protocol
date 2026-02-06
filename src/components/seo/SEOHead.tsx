import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://nexart.io";
const SITE_NAME = "NexArt";
const DEFAULT_TITLE = "NexArt Protocol — Deterministic Generative Media Infrastructure";
const DEFAULT_DESCRIPTION = "NexArt is a protocol and SDK for reproducible, verifiable generative output — on-chain or off-chain. Same input. Same output. Everywhere.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
}

/**
 * SEOHead component for consistent, Search Console compliant SEO metadata.
 * 
 * Guarantees:
 * - Canonical URL always points to https://nexart.io/{path}
 * - Never emits lovable.app, supabase.co, or preview URLs
 * - OpenGraph URLs always match canonical
 * - Consistent site_name and branding
 */
const SEOHead = ({ 
  title, 
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false 
}: SEOHeadProps) => {
  const location = useLocation();
  
  // Build canonical URL - always nexart.io, never preview/staging/OAuth domains
  const path = location.pathname === "/" ? "" : location.pathname;
  const canonicalUrl = `${SITE_URL}${path}`;
  
  // Ensure OG image is absolute and on nexart.io
  const absoluteOgImage = ogImage.startsWith("http") 
    ? ogImage 
    : `${SITE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;
  
  // Full title with site name suffix
  const fullTitle = title 
    ? `${title} | ${SITE_NAME}` 
    : DEFAULT_TITLE;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Canonical - always nexart.io */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* OpenGraph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
    </Helmet>
  );
};

export default SEOHead;

// Export constants for use in individual pages
export { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION };
