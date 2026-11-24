import {byId, catalog, categories, demoBuild, sanitizeBuild} from './catalog.js';
import {compatibility} from './engine.js';
import {peripherals} from './peripherals.js';

export const SETUP_PALETTES = [
  {id: 'black', label: 'Чёрный', color: '#26292e'},
  {id: 'white', label: 'Белый', color: '#f2f2f0'},
  {id: 'gray', label: 'Серый', color: '#979da3'},
  {id: 'red', label: 'Красный', color: '#d74653'},
  {id: 'blue', label: 'Синий', color: '#437dd4'},
  {id: 'pink', label: 'Розовый', color: '#eb92b3'},
  {id: 'green', label: 'Зелёный', color: '#559368'},
];

const neutralOrder = {
  black: ['black', 'gray', 'white'], white: ['white', 'gray', 'black'],
  gray: ['gray', 'black', 'white'], red: ['black', 'gray', 'white'],
  blue: ['black', 'gray', 'white'], pink: ['white', 'gray', 'black'], green: ['white', 'gray', 'black'],
};

const colorWords = {
  black: /ч[её]рн|black|графит|graphite/i,
  white: /бел|white|светлый/i,
  gray: /серый|серая|серое|серо-|серебрист|gr[ae]y|silver/i,
  red: /красн|\bred\b/i,
  blue: /син[ияе]|голуб|blue/i,
  pink: /розов|pink/i,
  green: /зел[её]н|green/i,
  brown: /коричнев|brown/i,
  orange: /оранжев|orange/i,
  gold: /золотист|gold/i,
  yellow: /ж[её]лт|yellow/i,
};

function appearance(product) {
  // The shop's filter tags omit printed accents on several multicolour editions.
  const tones = [];
  for (const segment of (product.color || '').split(/\s*[\/+·]\s*/)) {
    for (const [tone, pattern] of Object.entries(colorWords)) {
      if (pattern.test(segment) && !tones.includes(tone)) tones.push(tone);
    }
  }
  for (const tone of product.colors || []) if (!tones.includes(tone)) tones.push(tone);
  return tones;
}

function caseProduct(part) {
  const white = part.color === 'white';
  return {...part, category: 'case', color: white ? 'Белый' : 'Чёрный', colors: [white ? 'white' : 'black']};
}

function colorRank(product, requested) {
  const tones = appearance(product);
  const position = tones.indexOf(requested);
  if (position === 0) {
    const accents = tones.slice(1);
    const contrastingAccent = accents.some(tone => !neutralOrder[requested].includes(tone));
    const rank = accents.length === 0 ? 0 : contrastingAccent ? 1.5 : 1;
    return {rank, match: 'exact'};
  }
  if (position > 0) return {rank: 2, match: 'accent'};
  const neutral = neutralOrder[requested].indexOf(tones[0]);
  if (neutral < 0) return {rank: Infinity, match: 'neutral'};
  return {rank: 3 + neutral * 2 + Number(tones.length > 1), match: 'neutral'};
}

function selectProduct(candidates, palette, currentId) {
  let best;
  for (const product of candidates) {
    const {rank, match} = colorRank(product, palette.id);
    if (!Number.isFinite(rank)) continue;
    if (!best || rank < best.rank || (rank === best.rank && product.id === currentId)) {
      best = {product, rank, match};
    }
  }
  return best;
}

function itemSummary({product, match}) {
  return {category: product.category, name: product.name, id: product.id, color: product.color, match};
}

export function pickColorSetup(paletteId, currentBuild, currentWorkplace = {}) {
  const palette = SETUP_PALETTES.find(p => p.id === paletteId);
  if (!palette) return null;
  const saved = sanitizeBuild(currentBuild);
  const internals = categories.map(([category]) => category).filter(category => category !== 'case');
  const newPC = internals.every(category => !saved[category]);
  const build = newPC ? {...demoBuild, case: saved.case} : {...saved};
  // Isolate case-dependent incompatibilities, including RAM clearance with a raised cooler.
  // Errors shared with the caseless build come from internals the user chose to keep.
  const intrinsic = new Set(compatibility({...build, case: null}).errors.map(error => error.code));
  const fittingCases = catalog.case.filter(part =>
    compatibility({...build, case: part.id}).errors.every(error => intrinsic.has(error.code)));
  const pickedCase = selectProduct(fittingCases.map(caseProduct), palette, saved.case);
  const caseItem = pickedCase ? itemSummary(pickedCase) :
    itemSummary({product: caseProduct(byId[saved.case]), match: 'retained'});
  build.case = caseItem.id;
  const items = [caseItem];
  const selection = {};
  for (const category of ['monitor', 'keyboard', 'mouse', 'chair']) {
    const candidates = peripherals.filter(p => p.category === category);
    const picked = selectProduct(candidates, palette, currentWorkplace?.[category]);
    if (!picked) return null;
    items.push(itemSummary(picked));
    selection[category] = picked.product.id;
  }
  const addedInternals = newPC ? internals.map(category => ({
    category, id: build[category], name: byId[build[category]].name,
  })) : [];
  return {palette, build, selection, items, addedInternals};
}
