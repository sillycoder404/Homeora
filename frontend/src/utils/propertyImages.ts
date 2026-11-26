const fallbackImageIds = [
  'photo-1600585154340-be6161a56a0c',
  'photo-1600607687939-ce8a6c25118c',
  'photo-1600566753086-00f18fb6b3ea',
  'photo-1600047509807-ba8f99d2cdde',
  'photo-1600573472550-8090b5e0745e',
  'photo-1564013799919-ab600027ffc6',
  'photo-1600607687920-4e2a09cf159d',
  'photo-1600585154526-990dced4db0d',
];

export interface PropertyGalleryImage {
  url: string;
  fileId: string;
  isRepresentative: boolean;
}

function getImageUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=82`;
}

export function getPropertyFallbackImage(city: string, propertyId = ''): string {
  const key = `${city}${propertyId}`;
  const index = [...key].reduce((sum, character) => sum + character.charCodeAt(0), 0) % fallbackImageIds.length;
  return getImageUrl(fallbackImageIds[index]);
}

export function getPropertyGalleryImages(
  city: string,
  propertyId: string,
  images: ReadonlyArray<{ url: string; fileId: string }> = [],
  count = 4,
): PropertyGalleryImage[] {
  const gallery: PropertyGalleryImage[] = [];
  const usedUrls = new Set<string>();
  for (const image of images) {
    if (gallery.length >= count) break;
    if (!image.url || usedUrls.has(image.url)) continue;

    gallery.push({
      ...image,
      isRepresentative: image.fileId.startsWith('seed-'),
    });
    usedUrls.add(image.url);
  }

  const key = `${city}${propertyId}`;
  const startIndex = [...key].reduce((sum, character) => sum + character.charCodeAt(0), 0) % fallbackImageIds.length;

  for (let offset = 0; gallery.length < count && offset < fallbackImageIds.length; offset += 1) {
    const photoId = fallbackImageIds[(startIndex + offset) % fallbackImageIds.length];
    const url = getImageUrl(photoId);
    if (usedUrls.has(url)) continue;

    gallery.push({
      url,
      fileId: `gallery-${propertyId}-${photoId}`,
      isRepresentative: true,
    });
    usedUrls.add(url);
  }

  return gallery;
}
