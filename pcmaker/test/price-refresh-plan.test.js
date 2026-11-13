import test from 'node:test';
import assert from 'node:assert/strict';
import {createRefreshPlan,planSummary,runRefreshPlan,attemptRecord,retainManualOffer,updateHostCircuit} from '../scripts/price-refresh-plan.mjs';
import {emptyOverlay,applyResult} from '../scripts/price-refresh-core.mjs';

const products={ssd:{name:'Samsung 980 1 ТБ',sku:'MZ-V8V1T0BW'},cpu:{name:'AMD Ryzen 5 7600'}};
const old={price:10000,currency:'RUB',date:'2026-10-10',store:'KNS',url:'https://www.kns.ru/product/samsung-980/',availability:'in-stock'};
const backup={...old,store:'Регард',url:'https://www.regard.ru/product/384716/samsung-980'};
const entry=(offer=old,id='ssd',region='ru')=>({id,region,offer});
const confirmed=(target,availability='in-stock')=>({offer:{...target.offer,price:12000,date:'2026-11-13',availability},httpStatus:200,requestAttempts:1});

test('Candidate plan keeps current source first, deduplicates cards and isolates currencies',()=>{
 const entries=[entry(old),entry({...old,price:8000,url:old.url+'#details'}),entry(backup),entry({...backup,currency:'BYN'}),entry({...old,currency:'BYN',url:'https://5element.by/products/123-samsung-980'},'ssd','by'),entry({...old,url:'https://www.kns.ru/search/?q=980'}),entry({...old,url:'https://user:secret@www.kns.ru/product/x/'}),entry(old,'missing')];
 const plan=createRefreshPlan(products,entries);
 assert.equal(plan.length,2);assert.equal(plan[0].candidates.length,2);assert.equal(plan[0].candidates[0].offer.price,10000);
 assert.deepEqual(plan.map(p=>p.region),['ru','by']);assert.equal(plan[1].candidates[0].offer.currency,'BYN');
 assert.deepEqual(planSummary(plan),{products:2,withBackup:1,candidates:3,regions:{ru:1,by:1},sources:{'kns.ru':1,'regard.ru':1,'5element.by':1}});
 assert.equal(createRefreshPlan(products,entries,{region:'ru',host:'regard.ru'})[0].candidates.length,1);
 assert.equal(createRefreshPlan(products,entries,{limit:1}).length,1);
});

test('Failed primary falls back only to a newly confirmed alternative and records both attempts',async()=>{
 const plan=createRefreshPlan(products,[entry(old),entry(backup)]);
 const [item]=await runRefreshPlan(plan,{attempt:async t=>t.offer.store==='KNS'?{error:'robots-unavailable',cause:'http-503',httpStatus:503,requestAttempts:3}:confirmed(t)});
 assert.equal(item.result.offer.store,'Регард');assert.equal(item.result.offer.date,'2026-11-13');assert.equal(item.fallbackUpdated,true);
 assert.deepEqual(item.attempts[0],{url:old.url,status:'blocked',reason:'robots-unavailable',cause:'http-503',httpStatus:503,requestAttempts:3});
 const overlay=emptyOverlay();overlay.items.ru.ssd=old;
 applyResult(overlay,item.target,item.result,'2026-11-13T12:00:00Z');
 assert.equal(overlay.items.ru.ssd.price,12000);assert.equal(overlay.checks.ru.ssd.url,backup.url);assert.equal(overlay.checks.ru.ssd.status,'updated');
});

test('All failed candidates preserve old amount and date, including when a fallback once had a cheaper quote',async()=>{
 const plan=createRefreshPlan(products,[entry(old),entry({...backup,price:1})]);
 const [item]=await runRefreshPlan(plan,{attempt:async()=>({error:'price-not-confirmed'})});
 const overlay=emptyOverlay();overlay.items.ru.ssd={...old};
 applyResult(overlay,item.target,item.result,'2026-11-13T12:00:00Z');
 assert.deepEqual(overlay.items.ru.ssd,old);assert.equal(item.fallbackUpdated,false);assert.equal(item.attempts.length,2);
 assert.equal(overlay.checks.ru.ssd.url,old.url);assert.equal(overlay.checks.ru.ssd.status,'unverified');
});

test('Confirmed in-stock wins over out-of-stock and stops unnecessary additional requests',async()=>{
 const third={...backup,url:'https://www.regard.ru/product/384717/samsung-980'};
 let requests=0;
 const [item]=await runRefreshPlan(createRefreshPlan(products,[entry(old),entry(backup),entry(third)]),{attempt:async t=>{requests++;return confirmed(t,t.offer.store==='KNS'?'out-of-stock':'in-stock');}});
 assert.equal(requests,2);assert.equal(item.result.offer.url,backup.url);assert.equal(item.fallbackUpdated,true);
 let primaryCalls=0;
 const [primary]=await runRefreshPlan(createRefreshPlan(products,[entry(old),entry(backup)]),{attempt:async t=>{primaryCalls++;return confirmed(t);}});
 assert.equal(primaryCalls,1);assert.equal(primary.fallbackUpdated,false);
});

test('A failed backup cannot overwrite a confirmed primary; unknown stock is not labelled in-stock',async()=>{
 const plan=createRefreshPlan(products,[entry(old),entry(backup)]);
 const [primary]=await runRefreshPlan(plan,{attempt:async t=>t.offer.store==='KNS'?confirmed(t,'unknown'):{error:'http-404',httpStatus:404,attempts:1}});
 assert.equal(primary.result.offer.availability,'unknown');assert.equal(primary.target.offer.url,old.url);assert.equal(primary.attempts.length,2);
 const overlay=emptyOverlay();applyResult(overlay,primary.target,primary.result,'2026-11-13T12:00:00Z');
 assert.equal(overlay.checks.ru.ssd.status,'updated');
 const [unknown]=await runRefreshPlan(plan,{attempt:async t=>confirmed(t,t.offer.store==='KNS'?'out-of-stock':'unknown')});
 assert.equal(unknown.result.offer.availability,'unknown');assert.equal(unknown.result.offer.url,backup.url);
});

test('At most three hosts run together and a host never receives concurrent candidate requests',async()=>{
 const entries=[entry(old),entry(backup),entry({...old,url:'https://www.kns.ru/product/cpu/'},'cpu'),entry({...backup,url:'https://www.regard.ru/product/cpu'},'cpu'),entry({...old,url:'https://www.andpro.ru/product/cpu/'},'cpu')];
 const manyProducts={...products};
 for(const [index,host] of ['regard.ru','andpro.ru','redragon.ru','lifebook-shop.ru'].entries()){
  const id='part-'+index;manyProducts[id]=products.ssd;entries.push(entry({...old,url:'https://'+host+'/product/part/'},id));
 }
 const plan=createRefreshPlan(manyProducts,entries),active=new Set();let peak=0;
 await runRefreshPlan(plan,{concurrency:50,attempt:async t=>{
  const host=new URL(t.offer.url).hostname;
  assert.ok(!active.has(host));active.add(host);peak=Math.max(peak,active.size);
  await new Promise(resolve=>setTimeout(resolve,1));active.delete(host);
  return {error:'product-not-confirmed'};
 }});
 assert.equal(peak,3);assert.equal(active.size,0);
});

test('Attempt diagnostics exclude HTML, exception text and arbitrary sensitive fields',()=>{
 const target=createRefreshPlan(products,[entry(old)])[0].candidates[0];
 const record=attemptRecord(target,{error:'network-error',cause:'token secret',html:'private',headers:{authorization:'secret'},httpStatus:999,attempts:100});
 assert.deepEqual(record,{url:old.url,status:'error',reason:'network-error'});
});

test('Fresh reviewed ordinary Ozon offer is retained without claiming an automatic price check',async()=>{
 const ozon={...old,url:'https://www.ozon.ru/product/samsung-980-123456789/',store:'Ozon',seller:'Ozon Россия',sellerType:'ozon',priceType:'regular',condition:'new',verification:'reviewed-source',date:'2026-11-13',sellerVerifiedAt:'2026-11-13'};
 const plan=createRefreshPlan(products,[entry(ozon),entry(backup)]);
 const [item]=await runRefreshPlan(plan,{now:Date.parse('2026-11-20T12:00:00Z'),attempt:async()=>assert.fail('fresh manual price must not be replaced by unsupported automatic refresh')});
 assert.equal(item.manualRetained,true);assert.equal(item.result.error,'manual-review-required');assert.equal(item.result.offer,undefined);
 const overlay=emptyOverlay();overlay.items.ru.ssd={...ozon};
 applyResult(overlay,item.target,item.result,'2026-11-20T12:00:00Z');
 assert.deepEqual(overlay.items.ru.ssd,ozon);assert.equal(overlay.checks.ru.ssd.status,'unverified');
 assert.deepEqual(item.attempts,[{url:ozon.url,status:'unverified',reason:'manual-review-required',requestAttempts:0}]);
});

test('Stale, out-of-stock or unapproved Ozon snapshots are not protected from verified fallbacks',async()=>{
 const ozon={...old,url:'https://www.ozon.ru/product/samsung-980-123456789/',store:'Ozon',seller:'Ozon Россия',sellerType:'ozon',priceType:'regular',condition:'new',verification:'reviewed-source',date:'2026-11-13',sellerVerifiedAt:'2026-11-13'};
 for(const change of [{date:'2026-11-05',sellerVerifiedAt:'2026-11-05'},{availability:'out-of-stock'},{priceType:'ozon-card'},{sellerType:'marketplace'},{condition:'used'},{verification:'structured-data'}]){
  const plan=createRefreshPlan(products,[entry({...ozon,...change}),entry(backup)]),now=Date.parse('2026-11-13T12:00:00Z');
  assert.equal(retainManualOffer(plan[0].candidates[0],now),false);
  const [item]=await runRefreshPlan(plan,{now,attempt:async t=>t.offer.url.includes('ozon.ru')?{error:'unsupported-source'}:confirmed(t)});
  assert.equal(item.manualRetained,false);assert.equal(item.fallbackUpdated,true);assert.equal(item.result.offer.url,backup.url);
 }
});

test('Approved manual Ozon in a later candidate is selected and persisted with its original check date',async()=>{
 const ozon={...old,url:'https://www.ozon.ru/product/samsung-980-123456789/',store:'Ozon',seller:'Ozon Россия',sellerType:'ozon',priceType:'regular',condition:'new',verification:'reviewed-source',date:'2026-11-12',sellerVerifiedAt:'2026-11-12'};
 const now=Date.parse('2026-11-13T12:00:00Z'),plan=createRefreshPlan(products,[entry(old),entry(backup),entry(ozon)],{now});
 const [item]=await runRefreshPlan(plan,{now,attempt:async()=>assert.fail('known manual Ozon should be preferred even when not first')});
 const overlay=emptyOverlay();overlay.items.ru.ssd={...old};
 applyResult(overlay,item.target,item.result,'2026-11-13T12:00:00Z');
 assert.equal(item.manualRetained,true);assert.equal(item.target.offer.url,ozon.url);
 assert.deepEqual(overlay.items.ru.ssd,ozon);assert.equal(overlay.checks.ru.ssd.reason,'manual-review-required');
});

test('A duplicate card keeps better fresh manual evidence but never takes an older or unapproved quote',()=>{
 const now=Date.parse('2026-11-13T12:00:00Z');
 const ozon={...old,url:'https://www.ozon.ru/product/samsung-980-123456789/',store:'Ozon',seller:'Ozon Россия',sellerType:'ozon',priceType:'regular',condition:'new',verification:'reviewed-source',date:'2026-11-13',sellerVerifiedAt:'2026-11-13'};
 const stale={...ozon,date:'2026-11-01',sellerVerifiedAt:'2026-11-01',price:9000};
 const unapproved={...ozon,sellerType:'marketplace',price:1};
 const plan=createRefreshPlan(products,[entry(stale),entry(ozon),entry(stale),entry(unapproved)],{now});
 assert.equal(plan[0].candidates.length,1);assert.deepEqual(plan[0].candidates[0].offer,ozon);
 const earlierFresh={...ozon,date:'2026-11-12',sellerVerifiedAt:'2026-11-12',price:8000};
 assert.equal(createRefreshPlan(products,[entry(ozon),entry(earlierFresh)],{now})[0].candidates[0].offer.date,'2026-11-13');
});

test('Long or unusable Retry-After closes the host for later products and fallback rounds',async()=>{
 for(const failure of [{error:'http-503',retryAfterMs:120000},{error:'http-503',retryAfterUnusable:true}]){
  const state={circuit:null,circuitCause:null,failures:0};let requests=0;
  const plan=createRefreshPlan(products,[entry(old),entry({...old,url:'https://www.kns.ru/product/cpu/'},'cpu'),entry({...old,url:'https://www.kns.ru/product/alternative/'})]);
  const results=await runRefreshPlan(plan,{attempt:async()=>{
   if(state.circuit)return {error:state.circuit,cause:state.circuitCause,requestAttempts:0};
   requests++;updateHostCircuit(state,failure);return failure;
  }});
  assert.equal(requests,1);assert.equal(state.circuit,'source-rate-limited');assert.equal(state.circuitCause,'http-503');
  assert.equal(results[0].attempts[1].reason,'source-rate-limited');assert.equal(results[1].attempts[0].requestAttempts,0);
 }
 const state={circuit:null,circuitCause:null,failures:0};
 updateHostCircuit(state,{error:'http-503',retryAfterMs:3000});assert.equal(state.circuit,null);
 updateHostCircuit(state,{offer:{},retryAfterMs:120000});assert.equal(state.circuit,null);
});
