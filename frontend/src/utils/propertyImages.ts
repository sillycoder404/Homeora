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

export function getPropertyFallbackImage(city: string, propertyId = ''): string {
  const key = `${city}${propertyId}`;
  const index = [...key].reduce((sum, character) => sum + character.charCodeAt(0), 0) % fallbackImageIds.length;
  return `https://images.unsplash.com/${fallbackImageIds[index]}?auto=format&fit=crop&w=1200&q=82`;
}
