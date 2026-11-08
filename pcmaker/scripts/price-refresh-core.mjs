// Deliberately conservative: one exact public Product/Offer, never search results,
// recommendation prices, aggregates, currency conversion or anti-bot workarounds.
export const allowedHosts = new Set(['kns.ru','regard.ru','5element.by','andpro.ru','redragon.ru','masterdom.by','tecno.by','time-shop.by','cybermarket.by','nexton.by','unifox.by','ultraprice.by','dns-shop.ru','newegg.com','logitechg.com','onecom.ru','r-seven.ru','tec.by','onlife.by','mvideo.ru','lifebook-shop.ru']);
export const supportedHosts = new Set(['kns.ru','regard.ru','5element.by','andpro.ru','redragon.ru','masterdom.by','tecno.by','time-shop.by','cybermarket.by','nexton.by','unifox.by','ultraprice.by','logitechg.com','newegg.com','lifebook-shop.ru']);
export const hostOf = url => new URL(url).hostname.replace(/^www\./,'');
export function allowedURL(value, original) {
  try {
    const u = new URL(value), host = hostOf(u.href);
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && allowedHosts.has(host) && (!original || host === hostOf(original)) && !/(?:search|cart|checkout|account|login)(?:\/|$)/i.test(u.pathname) && !['q','search','digiSearch'].some(k=>u.searchParams.has(k));
  } catch { return false; }
}
function entity(s='') {
  return String(s).replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>{const cp=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return cp>=0&&cp<=0x10ffff?String.fromCodePoint(cp):'';}).replace(/&(?:amp|quot|apos|lt|gt|nbsp);/g,x=>({'&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' '})[x]);
}
function text(s) { return entity(String(s).replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim(); }
const normalized = s => String(s??'').normalize('NFKC').toLowerCase().replace(/[^a-zа-яё0-9]/g,'');
const tokens = s => String(s??'').normalize('NFKC').toLowerCase().match(/[a-zа-яё0-9]+/g)||[];
export function identityMatches(product, candidate) {
  const identifiers = [candidate.sku,candidate.mpn].filter(v=>v!==undefined).map(normalized);
  if(product.sku) {
    // A slash inside a part number is significant; only spaced separators denote aliases.
    const variants=String(product.sku).split(/\s+\/\s+|\s*;\s*/).filter(v=>normalized(v).length>=4);
    return variants.some(v=>{
      if(identifiers.includes(normalized(v)))return true;
      const pieces=tokens(v), pattern=pieces.join('[^a-zа-яё0-9]*');
      return new RegExp('(?:^|[^a-zа-яё0-9])'+pattern+'(?=$|[^a-zа-яё0-9])','i').test(String(candidate.name||''));
    });
  }
  const expected=tokens(product.name).filter(t=>!['гб','тб','gb','tb','гц','мгц','вт','mhz','ram','ssd'].includes(t));
  const actual=new Set(tokens(candidate.name));
  const variants=['chromax','redux','se','pro','max','plus','ti','super','v2','v3','v4','v5','oc','lhr'];
  if(variants.some(t=>actual.has(t)&&!expected.includes(t)))return false;
  return expected.some(t=>/\d/.test(t)&&t.length>=3)&&expected.every(t=>actual.has(t));
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m=>[m[1].toLowerCase(),entity(m[2]??m[3])]));
}
function primaryProducts(html) {
  const products=[];
  function root(value) {
    if(Array.isArray(value)) { value.forEach(root); return; }
    if(!value||typeof value!=='object')return;
    if([value['@type']].flat().some(t=>['Product','ProductModel'].includes(t))) products.push(value);
    if(value['@graph'])root(value['@graph']);
    // Do not recurse through isSimilarTo, itemListElement or recommendations.
  }
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    if(attributes(m[0].slice(0,m[0].indexOf('>')+1)).type?.toLowerCase()!=='application/ld+json')continue;
    try {root(JSON.parse(m[1]));} catch { /* malformed markup is not evidence */ }
  }
  return products;
}
function microProduct(html) {
  const h1=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>text(m[1]));
  if(h1.length!==1)return null;
  const fields={};
  for(const m of html.matchAll(/<(?:meta|link)\b[^>]*>/gi)) {
    const a=attributes(m[0]);if(!['price','priceCurrency','availability'].includes(a.itemprop))continue;
    (fields[a.itemprop]??=[]).push(a.content??a.href);
  }
  if(Object.values(fields).some(v=>new Set(v).size!==1))return null;
  return {'@type':'Product',name:h1[0],offers:{'@type':'Offer',price:fields.price?.[0],priceCurrency:fields.priceCurrency?.[0],availability:fields.availability?.[0]}};
}
function lifebookProduct(html) {
  const main=html.match(/<div\b[^>]*class="[^"]*\bpdp-price__main\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
  const h1=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>text(m[1]));
  if(!main||h1.length!==1)return null;
  const tags=[...html.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(m=>attributes(m[0]));
  const retail=tags.filter(a=>a.property==='product:price:amount').map(a=>a.content), currency=tags.filter(a=>a.property==='product:price:currency').map(a=>a.content);
  const visible=[...main.matchAll(/<span\b[^>]*>/gi)].map(m=>attributes(m[0])).filter(a=>a.itemprop==='price').map(a=>a.content);
  if(retail.length!==1||currency.length!==1||visible.length!==1||retail[0]!==visible[0])return null;
  return {'@type':'Product',name:h1[0],sku:tags.find(a=>a.itemprop==='sku')?.content,offers:{'@type':'Offer',price:retail[0],priceCurrency:currency[0],availability:tags.find(a=>a.itemprop==='availability')?.href}};
}
const availability = value => /(?:^|\/)InStock$/i.test(value||'')?'in-stock':/(?:^|\/)(?:OutOfStock|Discontinued|SoldOut)$/i.test(value||'')?'out-of-stock':'unknown';
export function parseOffer(html, target, date) {
  if(!allowedURL(target.offer.url))return {error:'unsafe-url'};
  const host=hostOf(target.offer.url), expected={ru:'RUB',by:'BYN',usd:'USD'}[target.region];
  if(!supportedHosts.has(host))return {error:'unsupported-source'};
  // Guard actual block pages, not a normal product footer mentioning reCAPTCHA.
  const title=text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
  if(/access denied|just a moment|captcha|доступ ограничен|подтвердите.*человек/i.test(title))return {error:'access-blocked'};
  let candidates=primaryProducts(html);
  // This shop displays a separate B2B price. Only the main retail amount corroborated
  // by the product-price metadata is considered; never pick the lowest page number.
  if(host==='lifebook-shop.ru'){const p=lifebookProduct(html);candidates=p?[p]:[];}
  if(!candidates.length&&['kns.ru','masterdom.by'].includes(host)){const p=microProduct(html);if(p)candidates=[p];}
  const matching=candidates.filter(p=>identityMatches(target.product,p));
  if(matching.length!==1)return {error:matching.length?'ambiguous-product':'product-not-confirmed'};
  const product=matching[0], candidatesOffers=[product.offers].flat().filter(Boolean);
  const valid=[];
  for(const o of candidatesOffers) {
    if(o['@type']&&o['@type']!=='Offer')continue;
    if(o.url) {
      if(!allowedURL(o.url,target.offer.url))continue;
      if(new URL(o.url).pathname.replace(/\/$/,'')!==new URL(target.offer.url).pathname.replace(/\/$/,''))continue;
    }
    if(o.priceCurrency!==expected)continue;
    if(o.priceSpecification?.valueAddedTaxIncluded===false||o.priceSpecification?.valueAddedTaxIncluded==='false')continue;
    const raw=typeof o.price==='number'?String(o.price):String(o.price??'').trim();
    if(!/^\d+(?:\.\d{1,2})?$/.test(raw))continue;
    const price=Number(raw);if(!Number.isFinite(price)||price<=0||price>10000000)continue;
    if(o.itemCondition&&!/(?:^|\/)NewCondition$/i.test(o.itemCondition))continue;
    valid.push({price,currency:expected,availability:availability(o.availability)});
  }
  if(valid.length!==1)return {error:valid.length?'ambiguous-offer':'price-not-confirmed'};
  const found=valid[0];
  // Manufacturer recommended prices are useful references, not a promise of stock.
  if(target.offer.kind==='manufacturer')found.availability='unknown';
  return {offer:{...target.offer,...found,date,url:target.offer.url,verification:'structured-data',sourceTitle:text(product.name)}};
}
export function emptyOverlay() {return {schemaVersion:1,checkedAt:null,items:{ru:{},by:{},usd:{}},checks:{ru:{},by:{},usd:{}}};}
export function applyResult(overlay,target,result,attemptedAt) {
  overlay.items[target.region]??={};overlay.checks[target.region]??={};
  if(result.offer) overlay.items[target.region][target.id]=result.offer;
  const reason=result.error||null;
  overlay.checks[target.region][target.id]={attemptedAt,status:result.offer?'updated':/access|robots|source-rate-limited|source-blocked|http-40[13]|http-429/.test(reason)?'blocked':reason==='http-404'?'unavailable':/network|timeout|http-5/.test(reason)?'error':'unverified',reason,url:allowedURL(target.offer.url)?target.offer.url:null};
  overlay.checkedAt=attemptedAt;
  return overlay;
}
export function robotsAllowed(body,url) {
  const groups=[];let group={agents:[],rules:[]},hasRules=false;
  for(const raw of body.split(/\r?\n/)) {
    const line=raw.replace(/#.*/,'').trim(), m=line.match(/^([\w-]+)\s*:\s*(.*)$/);if(!m)continue;
    const key=m[1].toLowerCase(), value=m[2].trim();
    if(key==='user-agent') {if(hasRules){groups.push(group);group={agents:[],rules:[]};hasRules=false;}group.agents.push(value.toLowerCase());}
    if(['allow','disallow'].includes(key)&&value&&group.agents.length){group.rules.push({allow:key==='allow',path:value});hasRules=true;}
  }
  groups.push(group);
  const specific=groups.filter(g=>g.agents.some(a=>a!=='*'&&'pcmakerpricebot'.includes(a))),selected=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
  const u=new URL(url), requestPath=u.pathname+u.search;let chosen={allow:true,length:-1};
  for(const rule of selected.flatMap(g=>g.rules)) {
    const end=rule.path.endsWith('$'),pattern=rule.path.replace(/\$$/,'').split('*').map(v=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');
    if(new RegExp('^'+pattern+(end?'$':'')).test(requestPath)) {const length=rule.path.replace(/\*/g,'').length;if(length>chosen.length||length===chosen.length&&rule.allow)chosen={...rule,length};}
  }
  return chosen.allow;
}
export async function fetchHTML(url,{fetcher=fetch,timeout=20000,maxBytes=4000000}={}) {
  if(!allowedURL(url))return {error:'unsafe-url'};
  try {
    let current=url;
    for(let redirects=0;redirects<4;redirects++) {
      const response=await fetcher(current,{redirect:'manual',signal:AbortSignal.timeout(timeout),headers:{'User-Agent':'PCmakerPriceBot/1.0 (+https://github.com/R92u/pcbuilder)','Accept':'text/html,application/xhtml+xml,text/plain;q=0.8','Accept-Language':'ru,en;q=0.8'}});
      if(response.status>=300&&response.status<400) {
        if(response.status===304)return {error:'not-modified-without-evidence'};
        const next=new URL(response.headers.get('location')||'',current).href;
        if(!allowedURL(next,url))return {error:'unsafe-redirect'};
        current=next;continue;
      }
      if(!response.ok)return {error:'http-'+response.status};
      if(Number(response.headers.get('content-length'))>maxBytes)return {error:'body-too-large'};
      const reader=response.body.getReader(),parts=[];let size=0;
      while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>maxBytes){await reader.cancel();return {error:'body-too-large'};}parts.push(chunk.value);}
      const data=new Uint8Array(size);let offset=0;for(const part of parts){data.set(part,offset);offset+=part.length;}
      const charset=response.headers.get('content-type')?.match(/charset\s*=\s*([\w-]+)/i)?.[1]||'utf-8';
      return {html:new TextDecoder(charset).decode(data),url:current};
    }
    return {error:'redirect-limit'};
  } catch(e) {return {error:e.name==='TimeoutError'||e.name==='AbortError'?'timeout':'network-error'};}
}
