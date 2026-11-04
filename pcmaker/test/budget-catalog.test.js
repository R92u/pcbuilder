import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogBudget} from '../dist/catalog-budget.js';
import {byId,resolve} from '../dist/catalog.js';
import {compatibility,thermalTargets} from '../dist/engine.js';
import {isVerified} from '../dist/verification.js';
import {productImages} from '../dist/product-images.js';
import {autoBuild,budgetPrice} from '../dist/autobuild.js';
import {cablesFor,portsFor} from '../dist/wiring.js';
import {fanMounts,defaultFanLayout} from '../dist/fan-layout.js';
import {filterProducts,shopProducts} from '../dist/shop-catalog-brands.js';
import {aioMount} from '../dist/aio.js';
import {frontIOPosition,caseLayout} from '../dist/layout.js';

const build={cpu:'r5-4500',motherboard:'a520m-a-pro',gpu:'gt1030-aero-oc',ram:'patriot-16-3200',storage:'p300-512',cooler:'ag300',psu:'pf450',case:'matrexx40'};
const now=Date.UTC(2026,10,4,12),prices=JSON.parse(fs.readFileSync(new URL('../dist/prices.json',import.meta.url))).items;

test('Sixteen entry-level variants have evidence, provenance, exact SKUs and photos',()=>{
 const parts=Object.values(catalogBudget).flat();assert.equal(parts.length,16);
 for(const [category,models] of Object.entries(catalogBudget)){
  assert.equal(models.length,2,category);
  for(const p of models){assert.ok(isVerified(byId[p.id]),p.id);assert.ok(productImages[p.id]?.image,p.id);assert.ok(prices[p.id]?.url&&prices[p.id].date,p.id);}
 }
 assert.equal(byId['gt1030-aero-oc'].vramType,'GDDR5');assert.equal(byId['gtx1650-d6-ventus-xs-oc'].connectorType,'none');
 assert.equal(byId['patriot-16-3200'].sku,'PSD416G320081');
});

test('Budget build is compatible; physical and socket mismatches still block it',()=>{
 assert.equal(compatibility(build).ready,true);
 for(const [change,code] of [[{motherboard:'h610m-e-ddr4'},'socket'],[{ram:'ddr5-32'},'memory'],[{motherboard:'b550'},'board-size'],[{gpu:'rtx5090-ventus3x-oc'},'gpu-size']])assert.ok(compatibility({...build,...change}).errors.some(e=>e.code===code),code);
 const intel={...build,cpu:'i3-12100f',motherboard:'h610m-e-ddr4'};assert.equal(compatibility(intel).ready,true);
 assert.ok(compatibility(build).warnings.some(w=>w.includes('Зазор')));
});

test('Slot-powered GPUs have no phantom power cables; A520 uses the 4-pin CPU socket',()=>{
 for(const gpu of ['gt1030-aero-oc','gtx1650-d6-ventus-xs-oc'])assert.equal(cablesFor({...build,gpu}).filter(c=>c.id.startsWith('gpu')).length,0);
 assert.equal(cablesFor(build).find(c=>c.id==='eps').strands,4);assert.match(portsFor(build).eps.name,/4 pin/);
 assert.equal(cablesFor({...build,motherboard:'h610m-e-ddr4'}).find(c=>c.id==='eps').strands,8);
});

test('Empty fan mounts do not become included fans or cooling capacity',()=>{
 assert.equal(fanMounts(build).filter(f=>f.wall==='front').length,3);
 assert.deepEqual(defaultFanLayout(build).map(f=>f.slot),['rear-1']);
 const empty={...build,case:'matrexx55-mesh'};assert.deepEqual(defaultFanLayout(empty),[]);
 const settings={ambient:22,load:'stress',front:80,rear:80,cpuFan:80};
 assert.ok(thermalTargets(empty,settings).case>thermalTargets(build,settings).case);
 assert.ok(cablesFor(empty).every(c=>!['frontFan','rearFan'].includes(c.id)));
 const p=byId['matrexx55-mesh'],frame=caseLayout(p);
 for(const id of ['usb3','usb2','audio','panel'])assert.ok(frontIOPosition(p,frame,id).every(Number.isFinite));
});

test('Budget filter works together with category, stock-price and compatibility filters',()=>{
 const filters={budget:true,category:'all',min:'',max:'',sort:'price-up'};
 assert.equal(filterProducts(shopProducts,filters,{},prices).length,16);
 assert.equal(filterProducts(shopProducts,{...filters,category:'gpu'}, {},prices).length,2);
 assert.deepEqual(filterProducts(shopProducts,{...filters,category:'motherboard',compatible:true},build,prices).map(p=>p.id),['a520m-a-pro']);
 assert.ok(filterProducts(shopProducts,{...filters,priced:true},{},prices).every(p=>prices[p.id].availability!=='out-of-stock'));
});

test('Unavailable historical offers cannot be silently replaced with budget estimates',()=>{
 for(const p of Object.values(catalogBudget).flat())if(prices[p.id].availability==='out-of-stock')assert.equal(budgetPrice(p,shopProducts.find(x=>x.id===p.id).category,prices,true,'RUB',now),null,p.id);
 assert.equal(budgetPrice(byId.ag200,'cooler',{},true,'RUB',now).date,'2026-11-04');
});

test('Autobuild can use the new verified budget platform without exceeding its budget',()=>{
 // Controlled availability: test algorithm behavior, not a claim of live stock.
 const fixture=Object.fromEntries(Object.values(build).map(id=>[id,{...prices[id],availability:'in-stock',date:'2026-11-04'}]));
 const result=autoBuild({budget:50000,purpose:'study',allowEstimates:false,prices:fixture,now});
 assert.equal(result.status,'ok');assert.ok(result.quote.planned<=50000);assert.equal(result.quote.estimatedCount,0);assert.equal(compatibility(result.build).ready,true);
 for(const p of Object.values(resolve(result.build)))assert.ok(p.budgetTier);
});

test('New chassis support only the verified AIO sizes',()=>{
 assert.equal(aioMount({case:byId.matrexx40,cooler:{type:'aio',radiator:360,radiatorDimensions:[402,120,27],fanThickness:25}}),null);
 assert.equal(aioMount({case:byId['matrexx55-mesh'],cooler:{type:'aio',radiator:360,radiatorDimensions:[402,120,27],fanThickness:25}}).wall,'front');
});
