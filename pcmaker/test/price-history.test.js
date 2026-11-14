import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {historyToday,normalizePriceHistory,appendPriceObservation,mergePriceObservations,recordRefreshObservations,componentPriceSeries,buildPriceSeries,priceSourceKey} from '../dist/price-history.js';

const now=Date.parse('2026-11-14T09:00:00Z'),options={now};
const quote=(overrides={})=>({date:'2026-11-13',price:10000,currency:'RUB',store:'Example',url:'https://example.com/product/cpu/',availability:'in-stock',verification:'structured-data',...overrides});
const entry=(id='cpu',offer=quote(),region='ru')=>({id,region,offer});
const history=entries=>mergePriceObservations(undefined,entries,options);

test('Observation days use Moscow time, not the UTC day or client timezone',()=>{
 assert.equal(historyToday('2026-11-13T20:59:59Z'),'2026-11-13');
 assert.equal(historyToday('2026-11-13T21:00:00Z'),'2026-11-14');
 assert.equal(historyToday('invalid'),null);
});

test('History rejects invented/future dates, currency mixing, nonproduct URLs and conditional prices',()=>{
 const bad=[{date:'2026-02-30'},{date:'2026-11-15'},{price:0},{price:NaN},{currency:'USD'},{url:'http://example.com/product/cpu/'},{url:'https://example.com/search/?q=cpu'},{url:'https://example.com/'},{url:'https://user:password@example.com/product/cpu/'},{availability:'available'},{condition:'used'},{priceType:'card'},{date:null},{estimated:true},{kind:'estimate'},{kind:'planning'},{verification:'unverified'}];
 assert.deepEqual(history(bad.map(p=>entry('cpu',quote(p)))).items.ru,{});
 const h=history([entry(),entry('cpu',quote({currency:'BYN',price:500}),'by'),entry('cpu',quote({currency:'USD',price:200}),'usd')]);
 assert.equal(componentPriceSeries(h,'cpu',{...options,region:'by'}).points[0].price,500);
 assert.equal(componentPriceSeries(h,'cpu',{...options,region:'usd'}).points[0].currency,'USD');
 assert.equal(componentPriceSeries(h,'cpu',options).points[0].currency,'RUB');
});

test('Retention keeps 120 inclusive calendar days and never manufactures intermediate days',()=>{
 const h=history([entry('cpu',quote({date:'2026-07-18'})),entry('cpu',quote({date:'2026-07-17'})),entry()]);
 assert.deepEqual(h.items.ru.cpu.map(p=>p.date),['2026-07-18','2026-11-13']);
 const seven=componentPriceSeries(h,'cpu',{...options,days:7});
 assert.equal(seven.startDate,'2026-11-08');assert.equal(seven.endDate,'2026-11-14');
 assert.equal(seven.points.length,1);assert.equal(seven.allTimeCount,2);
});

test('Same-day source observations are retained; daily series selects the deterministic latest',()=>{
 const first=quote({price:100}),second=quote({price:120,store:'Other',url:'https://other.example/product/cpu/'});
 let h=history([entry('cpu',first),entry('cpu',second)]);
 assert.equal(h.items.ru.cpu.length,2);assert.equal(componentPriceSeries(h,'cpu',options).points[0].price,120);
 // An exact old snapshot replay is not a newer check and cannot displace another source.
 h=appendPriceObservation(h,entry('cpu',first),options);
 assert.equal(componentPriceSeries(h,'cpu',options).points[0].price,120);
 h=appendPriceObservation(h,entry('cpu',quote({price:105})),options);
 assert.equal(h.items.ru.cpu.length,2);assert.equal(componentPriceSeries(h,'cpu',options).points[0].price,105);
 assert.deepEqual(normalizePriceHistory(h,options),h);
});

test('Real intraday timestamps order same-source updates and cannot overwrite observation dates',()=>{
 const h=history([entry('cpu',quote({price:110,observedAt:'2026-11-13T12:00:00Z'})),entry('cpu',quote({price:90,observedAt:'2026-11-13T10:00:00Z'}))]);
 assert.equal(h.items.ru.cpu[0].price,110);
 const mismatch=history([entry('cpu',quote({observedAt:'2026-11-14T12:00:00Z'}))]);
 assert.equal(mismatch.items.ru.cpu[0].date,'2026-11-13');assert.equal(mismatch.items.ru.cpu[0].observedAt,undefined);
});

test('Failed, blocked and manual-retained refresh checks leave all historical dates and values unchanged',()=>{
 const h=history([entry()]);
 const results=[{id:'cpu',region:'ru',result:{error:'http-503'}},{id:'cpu',region:'ru',result:{error:'robots-disallowed'}},{id:'cpu',region:'ru',result:{retainedOffer:quote()},manualRetained:true}];
 assert.deepEqual(recordRefreshObservations(h,results,{now,observedAt:'2026-11-14T09:00:00Z'}),h);
 const next=recordRefreshObservations(h,[{id:'cpu',region:'ru',result:{offer:quote({date:'2026-11-14',price:10000})}}],{now,observedAt:'2026-11-14T09:00:00Z'});
 assert.deepEqual(next.items.ru.cpu.map(p=>p.date),['2026-11-13','2026-11-14']);
 assert.equal(next.items.ru.cpu[1].observedAt,'2026-11-14T09:00:00.000Z');
});

test('Confirmed source/merchant changes break comparability while tracking query strings do not',()=>{
 const first=quote({date:'2026-11-11'}),same=quote({date:'2026-11-12',price:9000,url:'https://www.example.com/product/cpu/?utm_campaign=test#details'}),other=quote({date:'2026-11-13',price:8000,seller:'Another seller'});
 assert.equal(priceSourceKey(first),priceSourceKey(same));
 const points=componentPriceSeries(history([entry('cpu',first),entry('cpu',same),entry('cpu',other)]),'cpu',options).points;
 assert.deepEqual(points.map(p=>p.comparableToPrevious),[false,true,false]);
 assert.deepEqual(points.map(p=>p.sourceChanged),[false,false,true]);
});

test('Fixed-composition total requires same-day observations and reports missing members without carrying prices forward',()=>{
 const h=history([entry('cpu',quote({date:'2026-11-11',price:100})),entry('ram',quote({date:'2026-11-12',price:20})),entry('cpu',quote({date:'2026-11-13',price:110})),entry('ram',quote({date:'2026-11-13',price:22}))]);
 const series=buildPriceSeries(h,['cpu','ram'],options);
 assert.deepEqual(series.points.map(p=>[p.date,p.total,p.known,p.complete]),[['2026-11-11',100,1,false],['2026-11-12',20,1,false],['2026-11-13',132,2,true]]);
 assert.deepEqual(series.points[1].missingIds,['cpu']);assert.equal(series.points[2].comparableToPrevious,false);
 assert.equal(series.points.length,3);assert.equal(series.points[2].purchasable,true);
});

test('Out-of-stock prices remain historical quotes but a complete sum is not necessarily purchasable',()=>{
 const h=history([entry('cpu',quote({price:100,availability:'out-of-stock'})),entry('ram',quote({price:20,availability:'unknown'}))]);
 const point=buildPriceSeries(h,['cpu','ram'],options).points[0];
 assert.equal(point.total,120);assert.equal(point.complete,true);assert.equal(point.purchasable,false);
 assert.deepEqual(point.unavailableIds,['cpu']);assert.deepEqual(point.unknownAvailabilityIds,['ram']);
});

test('Totals compare only adjacent full same-source snapshots; currency buckets cannot borrow other prices',()=>{
 const entries=[];
 for(const date of ['2026-11-11','2026-11-12','2026-11-13'])for(const id of ['cpu','ram'])entries.push(entry(id,quote({date,price:0.1,...(date==='2026-11-13'&&id==='ram'?{store:'Backup',url:'https://backup.example/product/ram/'}:{})})));
 entries.push(entry('gpu',quote({price:200,currency:'USD'}),'usd'));
 const h=history(entries),points=buildPriceSeries(h,['cpu','ram'],options).points;
 assert.deepEqual(points.map(p=>p.total),[0.2,0.2,0.2]);
 assert.deepEqual(points.map(p=>p.comparableToPrevious),[false,true,false]);
 assert.deepEqual(points[2].sourceChangedIds,['ram']);
 const mixed=buildPriceSeries(h,['cpu','gpu'],options).points.at(-1);
 assert.equal(mixed.total,0.1);assert.equal(mixed.complete,false);assert.deepEqual(mixed.missingIds,['gpu']);
 assert.deepEqual(buildPriceSeries(h,[],options).points,[]);
});

test('An empty selected period stays empty and communicates older saved observations',()=>{
 const h=history([entry('cpu',quote({date:'2026-10-10'}))]);
 const series=componentPriceSeries(h,'cpu',{...options,days:7});
 assert.equal(series.availableCount,0);assert.equal(series.allTimeCount,1);assert.deepEqual(series.points,[]);
 assert.equal(componentPriceSeries(h,'missing',options).allTimeCount,0);
});

test('Bootstrapped data retains real snapshots and source evidence, without turning failed check dates into observations',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../dist/price-history.json',import.meta.url),'utf8'));
 const live=JSON.parse(fs.readFileSync(new URL('../dist/live-prices.json',import.meta.url),'utf8'));
 assert.equal(data.schemaVersion,1);
 let count=0;
 for(const [region,items] of Object.entries(data.items))for(const [id,rows] of Object.entries(items))for(const row of rows){
  count++;assert.ok(row.verification);assert.ok(row.snapshotSource||row.observedAt||row.verification==='reviewed-source');
  assert.ok(row.date<=historyToday());
 }
 // A retained manual quote's historical day must still exist with its source metadata.
 for(const [region,items] of Object.entries(live.items))for(const [id,offer] of Object.entries(items))if(offer.verification==='reviewed-source'&&Date.parse(historyToday())-Date.parse(offer.date)<120*86400000){
  assert.ok(data.items[region]?.[id]?.some(p=>p.date===offer.date&&p.price===offer.price&&p.url===offer.url),'Missing reviewed history '+region+':'+id);
 }
});
