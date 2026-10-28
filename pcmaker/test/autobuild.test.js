import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalog,categories,byId,demoBuild,resolve} from '../dist/catalog.js';
import {compatibility} from '../dist/engine.js';
import {autoBuild,quoteBuild,budgetPrice,buildScore} from '../dist/autobuild.js';
import {estimatePrice,gpuRanks} from '../dist/budget-data.js';
import {isVerified} from '../dist/verification.js';
import {priceQuality} from '../dist/price-quality.js';
const prices=JSON.parse(fs.readFileSync(new URL('../dist/prices.json',import.meta.url))).items;
const now=Date.UTC(2026,9,28,12);
const verifiedBuild={...demoBuild,gpu:'rx7600',psu:'a750gl'};
// Synthetic fresh offers isolate algorithm checks from real offer availability.
const freshOffers=Object.fromEntries(Object.entries(catalog).flatMap(([key,parts])=>parts.filter(isVerified).map(p=>[p.id,{price:estimatePrice(p,key),date:'2026-10-28',currency:'RUB',store:'Test fixture',url:'https://www.dns-shop.ru/product/test-'+p.id+'/'}])));
test('Every retail product has a positive planning estimate, but fictional cases are never priced',()=>{
 for(const [key,models] of Object.entries(catalog))for(const part of models){const amount=estimatePrice(part,key);assert.equal(Number.isFinite(amount)&&amount>0,!part.concept,part.id);if(key==='gpu')assert.ok(gpuRanks[part.id]>0);}
});
test('Fresh offers override estimates; invalid, absent and zero offers are never called verified',()=>{
 const p=byId['rx7600'],valid={price:35999,date:'2026-10-28',store:'DNS',url:'https://www.dns-shop.ru/product/example/'};
 assert.equal(budgetPrice(p,'gpu',{[p.id]:valid},true,'RUB',now).estimated,false);assert.equal(budgetPrice(p,'gpu',{[p.id]:valid},true,'RUB',now).price,35999);
 for(const offer of [{price:0},{price:10},null]){assert.equal(budgetPrice(p,'gpu',{[p.id]:offer},false,'RUB',now),null);assert.equal(budgetPrice(p,'gpu',{[p.id]:offer},true,'RUB',now).estimated,true);}
});
test('Reserve applies only to estimates and totals remain exact to a kopeck',()=>{
 const q=quoteBuild(verifiedBuild,prices,true,'RUB',now);assert.ok(q.estimatedCount>0);assert.equal(Math.round(q.planned*100),Math.round((q.total+q.reserve)*100));
 assert.equal(Math.round(q.reserve*100),q.rows.filter(r=>r.quote.estimated).reduce((s,r)=>s+Math.ceil(r.quote.price*100*.10),0));
 assert.equal(quoteBuild(verifiedBuild,prices,false,'RUB',now),null);
});
test('All purposes yield complete compatible physical builds within the full budget including reserve',()=>{
 const staleOffers=Object.fromEntries(Object.entries(freshOffers).map(([id,p])=>[id,{...p,date:'2026-10-20'}]));
 for(const prices of [freshOffers,staleOffers])for(const purpose of ['game','study','video'])for(const budget of [100000,120000,250000]){
  const r=autoBuild({budget,purpose,prices,now});assert.equal(r.status,'ok',purpose+' '+budget);assert.equal(Object.keys(r.build).length,8);assert.ok(compatibility(r.build).ready);assert.ok(r.quote.planned<=budget);assert.ok(!byId[r.build.case].concept);assert.ok(Object.values(resolve(r.build)).every(isVerified));assert.ok(byId[r.build.ram].capacity>=(purpose==='video'?32:16));assert.ok(byId[r.build.storage].capacity>=(purpose==='study'?500:1000));assert.equal(r.quote.staleCount,prices===staleOffers?8:0);
 }
});
test('Purpose changes the allocation and never mutates the input build or prices',()=>{
 const snapshot=JSON.stringify(freshOffers),game=autoBuild({budget:100000,purpose:'game',prices:freshOffers,now}),study=autoBuild({budget:100000,purpose:'study',prices:freshOffers,now});
 assert.notDeepEqual(game.build,study.build);assert.ok(gpuRanks[game.build.gpu]>gpuRanks[study.build.gpu]);assert.equal(JSON.stringify(freshOffers),snapshot);
});
test('Increasing budget cannot lower the selection score for the same purpose',()=>{
 let last=-Infinity;
 for(const budget of [80000,100000,150000,250000]){const r=autoBuild({budget,purpose:'game',prices:freshOffers,now});assert.equal(r.status,'ok');const score=buildScore(resolve(r.build),'game');assert.ok(score>=last-1e-9);last=score;}
});
test('Below-minimum budgets report the gap and do not leak an over-budget applicable build',()=>{
 const result=autoBuild({budget:1000,purpose:'study',prices,now});assert.equal(result.status,'over-budget');assert.ok(result.minimum>1000);assert.equal(result.build,undefined);assert.equal(result.shortfall,result.minimum-1000);
 const enough=autoBuild({budget:result.minimum,purpose:'study',prices,now});assert.equal(enough.status,'ok');assert.ok(enough.quote.planned<=result.minimum);
});
test('Strict mode uses only verified models with fresh prices and no reserve',()=>{
 const r=autoBuild({budget:250000,purpose:'game',allowEstimates:false,prices:freshOffers,now});assert.equal(r.status,'ok');assert.equal(r.quote.estimatedCount,0);assert.equal(r.quote.reserve,0);
 for(const row of r.quote.rows){assert.ok(isVerified(row.part));assert.equal(priceQuality(freshOffers[row.part.id],now).status,'fresh');}
 assert.equal(autoBuild({budget:100000,allowEstimates:false,prices:{},now}).status,'no-data');
 const stale=Object.fromEntries(Object.entries(freshOffers).map(([id,p])=>[id,{...p,date:'2026-10-20'}]));
 assert.equal(autoBuild({budget:250000,allowEstimates:false,prices:stale,now}).status,'no-data');
});
test('Invalid budget/purpose inputs are rejected and preview builds are deterministic',()=>{
 for(const budget of [0,-100,NaN,Infinity,2000001,'100000'])assert.equal(autoBuild({budget,prices,now}).status,'invalid');
 assert.equal(autoBuild({budget:100000,purpose:'unknown',prices,now}).status,'invalid');
 assert.deepEqual(autoBuild({budget:100000,prices,now}).build,autoBuild({budget:100000,prices,now}).build);
});
