// Regional storefronts confirmed by the city shown on their search pages.
export const storeCities = new Map([
  ['www', 'Москва'], ['spb', 'Санкт-Петербург'], ['ekaterinburg', 'Екатеринбург'],
  ['kazan', 'Казань'], ['krasnodar', 'Краснодар'], ['perm', 'Пермь'],
  ['samara', 'Самара'], ['ufa', 'Уфа'], ['voronezh', 'Воронеж']
]);

export function cityStoreLink(city, part) {
  if (!storeCities.has(city) || part.concept) return null;
  const url = new URL('/search/', 'https://' + city + '.xcom-shop.ru');
  url.searchParams.set('o', 'm');
  url.searchParams.set('s', part.sku || part.name);
  return {name: 'XCOM-SHOP · ' + storeCities.get(city), url: url.href, direct: false};
}
