import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

export default function PageMeta({ title, description, path = '/', image }: PageMetaProps) {
  const siteUrl = window.location.origin;
  return (
    <Helmet>
      <title>{title} | RealEstate India</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | RealEstate India`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${siteUrl}${path}`} />
      {image && <meta property="og:image" content={image} />}
      <link rel="canonical" href={`${siteUrl}${path}`} />
    </Helmet>
  );
}
