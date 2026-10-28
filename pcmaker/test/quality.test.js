import test from 'node:test';
import assert from 'node:assert/strict';
import {byId,catalog,categories,demoBuild,resolve} from '../dist/catalog.js';
import {dateStamp,priceQuality} from '../dist/price-quality.js';
import {verificationFor,isVerified} from '../dist/verification.js';
import {verificationRecords} from '../dist/verification-data.js';
import {budgetPrice,quoteBuild,autoBuild} from '../dist/autobuild.js';
import {compatibility,summarizePrices} from '../dist/engine.js';
import {priceSnapshot} from '../dist/regions.js';

const now=Date.UTC(2026,9,28,12),part=byId['r5-7600'];
const offer=(overrides={})=>({price:100.01,date:'2026-10-28',currency:'RUB',store:'Test fixture',url:'https://www.dns-shop.ru/product/test/',...overrides});
const quote=(item,allowEstimates=true,currency='RUB')=>budgetPrice(part,'cpu',{[part.id]:item},allowEstimates,currency,now);
const verifiedBuild={...demoBuild,gpu:'rx7600',psu:'a750gl'};
const buildOffers=build=>Object.fromEntries(Object.values(build).map(id=>[id,offer({price:1000})]));

test('Dates accept only real ISO calendar days, including leap-year boundaries',()=>{
 assert.equal(dateStamp('2024-02-29'),Date.UTC(2024,1,29));
 assert.equal(dateStamp('2026-10-28'),Date.UTC(2026,9,28));
 for(const value of ['2026-02-29','2026-04-31','2026-13-01','2026-00-01','2026-10-00','2026-1-1','2026-10-28T00:00:00Z',' 2026-10-28',20261028,null,undefined])assert.equal(dateStamp(value),null,String(value));
});

test('Price TTL is seven UTC calendar days inclusive, independent of time of day',()=>{
 for(const hour of [0,12,23]){
  const at=Date.UTC(2026,9,28,hour,59,59);
  assert.equal(priceQuality(offer(),at).status,'fresh');
  assert.deepEqual([priceQuality(offer({date:'2026-10-21'}),at).status,priceQuality(offer({date:'2026-10-21'}),at).age],['fresh',7]);
  assert.deepEqual([priceQuality(offer({date:'2026-10-20'}),at).status,priceQuality(offer({date:'2026-10-20'}),at).age],['stale',8]);
 }
 assert.equal(priceQuality(offer({date:'2026-10-29'}),now).status,'invalid');
 assert.equal(priceQuality(offer(),NaN).status,'invalid');
 for(const price of [0,-1,NaN,Infinity,'100'])assert.equal(priceQuality(offer({price}),now).status,'invalid');
 for(const date of ['2026-02-30','',null,undefined])assert.equal(priceQuality(offer({date}),now).status,'invalid');
});

test('Fresh offers have no reserve; stale offers retain provenance and add a rounded 10% reserve only with consent',()=>{
 const fresh=quote(offer(),false);assert.equal(fresh.kind,'offer');assert.equal(fresh.estimated,false);assert.equal(fresh.reserve,0);assert.equal(fresh.planned,10001);
 const stale=quote(offer({date:'2026-10-20'}));
 assert.equal(stale.kind,'stale');assert.equal(stale.estimated,true);assert.equal(stale.price,100.01);assert.equal(stale.reserve,10.01);assert.equal(stale.planned,11002);assert.equal(stale.date,'2026-10-20');assert.equal(stale.store,'Test fixture');assert.equal(stale.url,offer().url);
 assert.equal(quote(offer({date:'2026-10-20'}),false),null);
});

test('Unavailable offers are excluded even when estimates are allowed; unknown availability stays explicit',()=>{
 for(const date of ['2026-10-28','2026-10-20']){
  const item=offer({availability:'out-of-stock',date});assert.equal(priceQuality(item,now).status,'unavailable');assert.equal(quote(item,true),null);assert.equal(quote(item,false),null);
 }
 assert.equal(quote(offer()).availability,'unknown');
 assert.equal(quote(offer({availability:'in-stock'})).availability,'in-stock');
 for(const date of ['2026-10-29','2026-02-30',undefined])assert.equal(quote(offer({availability:'out-of-stock',date}),true),null,'Unavailable status must not fall back to a planning estimate');
});

test('Invalid or future RUB snapshots cannot pass as checked offers and only allow an explicitly separate planning estimate',()=>{
 for(const item of [offer({date:'2026-10-29'}),offer({date:'2026-02-30'}),offer({date:undefined}),offer({price:0})]){
  assert.equal(quote(item,false),null);
  const estimated=quote(item,true);assert.equal(estimated.kind,'estimate');assert.equal(estimated.estimated,true);assert.ok(estimated.reserve>0);assert.equal(estimated.store,undefined);assert.equal(estimated.url,undefined);
 }
});

test('BY estimates may reuse stale BYN only, never convert RUB or invent a missing Belarus price',()=>{
 const old=offer({currency:'BYN',date:'2026-10-20',store:'TEC.BY',url:'https://tec.by/product/test'}),stale=quote(old,true,'BYN');
 assert.equal(stale.kind,'stale');assert.equal(stale.price,100.01);assert.equal(stale.reserve,10.01);assert.equal(stale.url,old.url);assert.equal(quote(old,false,'BYN'),null);
 assert.equal(quote(offer({currency:'BYN'}),false,'BYN').estimated,false);
 for(const item of [undefined,offer(),offer({date:'2026-10-20'}),offer({currency:'BYN',date:'2026-10-29'}),offer({currency:'BYN',date:'2026-02-30'})])assert.equal(quote(item,true,'BYN'),null);
});

test('Regional snapshots reject missing or invalid dates, currency mismatch and credential-bearing URLs',()=>{
 const valid=offer({currency:'BYN',url:'https://tec.by/product/test'});
 const snapshot=priceSnapshot({currency:'BYN',items:{valid,missing:{...valid,date:undefined},invalid:{...valid,date:'2026-02-30'},rub:{...valid,currency:'RUB'},credentials:{...valid,url:'https://name:password@tec.by/product/test'},port:{...valid,url:'https://tec.by:8080/product/test'}}},'by');
 assert.deepEqual(Object.keys(snapshot.items),['valid']);assert.equal(snapshot.items.valid.price,100.01);
});

test('Verification is bound to reviewed specification values and fails closed after a catalog drift',()=>{
 assert.ok(Object.keys(verificationRecords).length>=30);
 for(const [id,record] of Object.entries(verificationRecords)){
  assert.ok(byId[id],id);assert.equal(isVerified(byId[id]),true,id);assert.equal(record.checkedAt,'2026-10-28');assert.ok(record.sources.length>0,id);assert.ok(record.sources.every(url=>new URL(url).protocol==='https:'),id);assert.ok(Object.keys(record.values).length>0,id);
 }
 assert.equal(verificationFor({...part,socket:'WRONG'}).status,'pending');
 assert.equal(verificationFor({id:'not-reviewed'}).status,'pending');assert.equal(verificationFor(undefined).status,'pending');
 assert.equal(verificationFor(catalog.case.find(p=>p.concept)).status,'concept');
 assert.equal(isVerified(byId.rtx4060),false,'Ambiguous RTX 4060 power revisions are intentionally not verified');
});

test('Pending models remain usable manually but cannot be quoted or silently selected by auto-build',()=>{
 assert.equal(compatibility(demoBuild).ready,true);
 const pendingBuild={...verifiedBuild,gpu:'rtx4060'},offers=buildOffers(pendingBuild);
 assert.equal(quoteBuild(pendingBuild,offers,false,'RUB',now),null);
 assert.equal(autoBuild({budget:100000,purpose:'study',allowEstimates:false,prices:offers,now}).status,'no-data');
 const withVerifiedGpu={...offers,rx7600:offer({price:2000})};
 const result=autoBuild({budget:100000,purpose:'study',allowEstimates:false,prices:withVerifiedGpu,now});
 assert.equal(result.status,'ok');assert.equal(result.build.gpu,'rx7600');assert.ok(Object.values(resolve(result.build)).every(isVerified));
});

test('A complete verified quote reports fresh, stale and planning rows separately with exact totals',()=>{
 const offers=buildOffers(verifiedBuild);offers['r5-7600']={...offers['r5-7600'],date:'2026-10-20',price:100.01};delete offers.ak400;
 const result=quoteBuild(verifiedBuild,offers,true,'RUB',now);
 assert.ok(result);assert.equal(result.rows.length,categories.length);assert.equal(result.staleCount,1);assert.equal(result.planningCount,1);assert.equal(result.estimatedCount,2);assert.equal(Math.round(result.planned*100),Math.round((result.total+result.reserve)*100));
 assert.equal(quoteBuild(verifiedBuild,offers,false,'RUB',now),null);
});

test('Historical totals distinguish stale, invalid and unavailable snapshots from fresh prices',()=>{
 const prices={
  [demoBuild.cpu]:offer({price:100}),
  [demoBuild.gpu]:offer({price:200,date:'2026-10-20'}),
  [demoBuild.ram]:offer({price:300,availability:'out-of-stock'}),
  [demoBuild.storage]:offer({price:400,date:'2026-10-29'})
 };
 const result=summarizePrices(demoBuild,prices,now);
 assert.equal(result.total,1000);assert.equal(result.known,4);assert.equal(result.complete,false);assert.equal(result.fresh,1);assert.equal(result.stale,1);assert.equal(result.unavailable,1);assert.equal(result.invalid,1);
});
