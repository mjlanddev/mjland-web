import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'video.movie' | 'video.tv_show' | 'article';
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  type = 'website'
}) => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  const fullTitle = `${title} | ${appName}`;
  const defaultDescription = `Discover the best movies and TV shows on ${appName}. High quality entertainment on our premium platform.`;
  const finalDescription = description || defaultDescription;

  return (
    <Helmet>
      {}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />

      {}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      {image && <meta property="og:image" content={image} />}

      {}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};
