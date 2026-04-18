import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, url = 'https://yourdomain.com' }) => {
  const siteName = 'Blood Donor Society BUETK';
  const fullTitle = `${title} | ${siteName}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": "Blood Donor Society Buetk",
    "alternateName": "BUETK Blood Donation Society",
    "url": url,
    "logo": `${url}/src/components/image.png`,
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Khuzdar",
      "addressRegion": "Balochistan",
      "addressCountry": "PK"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "emergency",
      "areaServed": "Khuzdar",
      "availableLanguage": ["English", "Urdu"]
    }
  };

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} /> }
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}/src/components/image.png`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}/src/components/image.png`} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
