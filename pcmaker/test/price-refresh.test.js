import test from 'node:test';
import assert from 'node:assert/strict';
import {parseOffer,identityMatches,emptyOverlay,applyResult,allowedURL,fetchHTML,robotsAllowed} from '../scripts/price-refresh-core.mjs';
const target={region:'ru',id:'ssd',product:{name:'Samsung 980 1 ТБ',sku:'MZ-V8V1T0BW'},offer:{price:10000,currency:'RUB',date:'2026-11-01',store:'Регард',url:'https://www.regard.ru/product/384716/nakopitel'}};
const product={ '@type':'Product',name:'Накопитель Samsung 980 MZ-V8V1T0BW',offers:{'@type':'Offer',price:'10990.00',priceCurrency:'RUB',availability:'https://schema.org/InStock'}};
const html=p=>'<script type="application/ld+json">'+JSON.stringify(p)+'</script>';
test('Only exact product direct offers update, never recommendations or aggregate low prices',()=>{
 assert.equal(parseOffer(html(product),target,'2026-11-08').offer.price,10990);
 assert.ok(parseOffer(html({...product,name:'Samsung other',isSimilarTo:[product]}),target,'2026-11-08').error);
 assert.ok(parseOffer(html({...product,offers:{'@type':'AggregateOffer',lowPrice:1,priceCurrency:'RUB'}}),target,'2026-11-08').error);
 assert.ok(parseOffer(html({...product,offers:{...product.offers,priceCurrency:'USD'}}),target,'2026-11-08').error);
 assert.ok(parseOffer(html({...product,offers:[product.offers,product.offers]}),target,'2026-11-08').error);
 assert.ok(parseOffer(html({...product,offers:{...product.offers,url:'https://www.regard.ru/product/different'}}),target,'2026-11-08').error);
});
test('OEM model suffixes and SKU aliases remain significant',()=>{
 assert.equal(identityMatches({name:'AMD Ryzen 5 7600'},{name:'AMD Ryzen 5 7600X'}),false);
 assert.equal(identityMatches({name:'AMD Ryzen 5 7600'},{name:'Процессор AMD Ryzen 5 7600 OEM'}),true);
 assert.equal(identityMatches({sku:'ELA6662RU / P24FDA-RAGL'},{mpn:'ELA6662RU'}),true);
 assert.equal(identityMatches({sku:'KF432C16BBK2/32'},{name:'KF432C16BBK2/16'}),false);
 assert.equal(identityMatches({sku:'ABC-123'},{name:'Model ABC-123A'}),false);
 assert.equal(identityMatches({sku:'ABC-123'},{sku:'ABC-123A',name:'Another model'}),false);
 assert.equal(identityMatches({name:'Kingston Fury Beast DDR5 32 ГБ'},{name:'Kingston Fury Beast DDR5 64 ГБ'}),false);
 assert.equal(identityMatches({name:'MSI GeForce RTX 3060 12G'},{name:'MSI GeForce RTX 3060 8G'}),false);
 assert.equal(identityMatches({name:'Noctua NH-D15'},{name:'Noctua NH-D15 chromax.black'}),false);
 assert.equal(identityMatches({name:'NVIDIA GeForce RTX 4070'},{name:'NVIDIA GeForce RTX 4070 SUPER'}),false);
});
test('Failed refresh preserves prior offer date, successful out-of-stock is explicit',()=>{
 const overlay=emptyOverlay();overlay.items.ru.ssd={...target.offer};
 applyResult(overlay,target,{error:'http-403'},'2026-11-08T10:00:00Z');
 assert.deepEqual(overlay.items.ru.ssd,target.offer);assert.equal(overlay.checks.ru.ssd.status,'blocked');
 const result=parseOffer(html({...product,offers:{...product.offers,availability:'https://schema.org/OutOfStock'}}),target,'2026-11-08');
 applyResult(overlay,target,result,'2026-11-08T11:00:00Z');assert.equal(overlay.items.ru.ssd.availability,'out-of-stock');assert.equal(overlay.items.ru.ssd.date,'2026-11-08');
 const invalid={...target,offer:{...target.offer,url:'https://name:password@www.kns.ru/product/private/'}};
 applyResult(overlay,invalid,{error:'unsafe-url'},'2026-11-08T12:00:00Z');assert.equal(overlay.checks.ru.ssd.url,null);
});
test('KNS microdata uses one main title and unambiguous price, never duplicated cards',()=>{
 const t={...target,offer:{...target.offer,url:'https://www.kns.ru/product/samsung-980/'}};
 const micro='<h1>Samsung 980 MZ-V8V1T0BW</h1><meta itemprop="price" content="10990"><meta content="RUB" itemprop="priceCurrency"><meta itemprop="availability" content="http://schema.org/InStock">';
 assert.equal(parseOffer(micro,t,'2026-11-08').offer.price,10990);
 assert.ok(parseOffer(micro+'<meta itemprop="price" content="100">',t,'2026-11-08').error);
});
test('Lifebook retail price must agree with main product metadata; B2B is not selected',()=>{
 const t={...target,offer:{...target.offer,url:'https://lifebook-shop.ru/catalog/pc-components/ssd/'}};
 const page='<h1>Samsung 980 MZ-V8V1T0BW</h1><meta property="product:price:amount" content="10990"><meta property="product:price:currency" content="RUB"><link itemprop="availability" href="https://schema.org/InStock"><div class="pdp-price__main"><span itemprop="price" content="10990">10990</span></div><div class="pdp-price__row--b2b">12990</div>';
 assert.equal(parseOffer(page,t,'2026-11-08').offer.price,10990);
 assert.ok(parseOffer(page.replace('content="10990">10990','content="12990">12990'),t,'2026-11-08').error);
});
test('Fetch rejects foreign redirects, untrusted hosts, oversized responses and 304 without evidence',async()=>{
 assert.equal(allowedURL('http://www.regard.ru/product/1'),false);assert.equal(allowedURL('https://127.0.0.1/x'),false);assert.equal(allowedURL('https://www.kns.ru/search/?q=x'),false);
 const redirect=await fetchHTML(target.offer.url,{fetcher:async()=>new Response(null,{status:302,headers:{location:'https://127.0.0.1/private'}})});assert.equal(redirect.error,'unsafe-redirect');
 const unchanged=await fetchHTML(target.offer.url,{fetcher:async()=>new Response(null,{status:304})});assert.equal(unchanged.error,'not-modified-without-evidence');
 const huge=await fetchHTML(target.offer.url,{maxBytes:5,fetcher:async()=>new Response('123456')});assert.equal(huge.error,'body-too-large');
 const failure=await fetchHTML(target.offer.url,{fetcher:async()=>{throw Error('token must not be copied');},delay:async()=>{}});assert.deepEqual(failure,{error:'network-error',attempts:3});
});
test('Robots exclusions, wildcards, longer allow rules and specific agents are honored',()=>{
 const robots='User-agent: *\nDisallow: /private\nDisallow: /*?*\nAllow: /private/public\nUser-agent: OtherBot\nDisallow: /';
 assert.equal(robotsAllowed(robots,'https://www.kns.ru/product/a/'),true);assert.equal(robotsAllowed(robots,'https://www.kns.ru/private/a'),false);assert.equal(robotsAllowed(robots,'https://www.kns.ru/private/public/a'),true);assert.equal(robotsAllowed(robots,'https://www.kns.ru/product/a/?q=x'),false);
 assert.equal(robotsAllowed('User-agent: PCmakerPriceBot\nDisallow: /\nUser-agent: *\nAllow: /','https://www.kns.ru/product/a/'),false);
});


test('Transient fetch failures retry at most twice and recover without changing source',async()=>{
 const waits=[];let requests=0;
 const result=await fetchHTML(target.offer.url,{delay:async ms=>waits.push(ms),fetcher:async()=>{
  if(++requests===1)throw Error('temporary');
  if(requests===2)return new Response('maintenance',{status:503});
  return new Response('verified product');
 }});
 assert.equal(result.html,'verified product');assert.equal(result.url,target.offer.url);assert.equal(result.attempts,3);
 assert.deepEqual(waits,[1000,2000]);
 let repeated=0;
 const exhausted=await fetchHTML(target.offer.url,{retries:50,delay:async()=>{},fetcher:async()=>{repeated++;return new Response('',{status:502});}});
 assert.equal(repeated,3);assert.equal(exhausted.error,'http-502');assert.equal(exhausted.httpStatus,502);
});

test('Retry-After delays are honored; excessive or invalid values stop the host request',async()=>{
 const now=Date.parse('2026-11-13T12:00:00Z');
 for(const header of ['3','Fri, 13 Nov 2026 12:00:03 GMT']){
  let requests=0;const waits=[];
  const result=await fetchHTML(target.offer.url,{now:()=>now,delay:async ms=>waits.push(ms),fetcher:async()=>++requests===1?new Response('',{status:429,headers:{'retry-after':header}}):new Response('ok')});
  assert.equal(result.html,'ok');assert.deepEqual(waits,[3000]);
 }
 for(const header of ['120','invalid','-1','1.5']){
  let requests=0;
  const result=await fetchHTML(target.offer.url,{now:()=>now,delay:async()=>assert.fail('must not sleep or retry early'),fetcher:async()=>{requests++;return new Response('',{status:429,headers:{'retry-after':header}});}});
  assert.equal(result.error,'http-429');assert.equal(requests,1);
  if(header==='120')assert.equal(result.retryAfterMs,120000);else assert.equal(result.retryAfterUnusable,true);
 }
});

test('Authentication failures, blocked pages and unsafe redirects are never retried',async()=>{
 const responses=[()=>new Response('',{status:401}),()=>new Response('',{status:403}),()=>new Response('<title>Just a moment</title>',{status:503}),()=>new Response('<title>Captcha</title>'),()=>new Response('',{status:503,headers:{'cf-mitigated':'challenge'}}),()=>new Response(null,{status:302,headers:{location:'https://127.0.0.1/private'}})];
 for(const response of responses){
  let requests=0;
  const result=await fetchHTML(target.offer.url,{delay:async()=>assert.fail('blocked sources must not retry'),fetcher:async()=>{requests++;return response();}});
  assert.ok(result.error);assert.equal(requests,1);
 }
});

test('Fetch deadline covers a stalled streamed body and cancels it',async()=>{
 let cancelled=false;
 const result=await fetchHTML(target.offer.url,{timeout:20,retries:0,fetcher:async()=>new Response(new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('partial'));},cancel(){cancelled=true;}}))});
 assert.equal(result.error,'timeout');assert.equal(result.attempts,1);assert.equal(cancelled,true);
});
