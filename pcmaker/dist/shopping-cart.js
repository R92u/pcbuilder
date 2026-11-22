// E-Techno product IDs matched by model or manufacturer SKU, 2026-11-22.
const products = new Map(Object.entries({
  "r5-5600": 22546,
  "r7-5700x": 22960,
  "r7-7700x": 24559,
  "r7-7800x3d": 21256,
  "i5-12400f": 13919,
  "r5-5500": 22957,
  "r5-9600x": 20252,
  "r7-9700x": 16465,
  "b550m-pro-vdh-wifi": 23301,
  "a520m-a-pro": 24471,
  "h610m-e-ddr4": 26436,
  "rtx5060-ventus2x-oc": 21076,
  "mem-kf556c36bbek2-16": 18579,
  "mem-kf556c36bbek2-32": 21566,
  "kc3000-1tb": 21615,
  "kc3000-2tb": 21617,
  "kc3000-4tb": 21619,
  "nv3-1tb": 16574,
  "nv3-2tb": 17447,
  "ssd-snv3s-500g": 17444,
  "ssd-aleg-960m-1tcs": 21637,
  "ssd-ap512gas2280p4x-1": 25713,
  "ssd-aleg-960m-2tcs": 21639,
  "aio-le360-v2": 19598,
  "aio-le240-v2": 19342,
  "ch560-white": 19236,
  "pk700d": 15894,
  "viper-steel-16-3200": 25649
}));

export function buildCart(parts) {
  const items = [];
  const missing = [];
  for (const [category, part] of Object.entries(parts)) {
    if (!part) continue;
    const productId = products.get(part.id);
    if (productId) items.push(productId + ':1');
    else missing.push({category, part});
  }
  return {
    url: items.length ? 'https://e-techno.net/checkout-link/?products=' + items.join(',') : null,
    count: items.length,
    missing
  };
}

export function buildCityCart(parts, region, city) {
  return region === 'ru' && city === 'voronezh' ? buildCart(parts) : null;
}
