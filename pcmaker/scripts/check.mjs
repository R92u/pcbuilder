import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {byId} from '../dist/catalog.js';
import {productImages} from '../dist/product-images.js';
import {priceSnapshot} from '../dist/regions.js';
import {foreignComponentOffers,peripheralOfferUpdates} from '../dist/foreign-prices.js';
import {peripheralById} from '../dist/peripherals-brands.js';
import {validForeignOffer} from '../dist/money.js';
import {priceQuality} from '../dist/price-quality.js';
import {validLiveOffer} from '../dist/live-price-data.js';
import {byStoreProduct} from '../dist/regions.js';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
for(const file of ['store-picker.js','store-picker.css'])if(!fs.existsSync(path.join(root,'dist',file)))throw Error('Missing '+file);
const bundle=JSON.parse(fs.readFileSync(path.join(root,'firebase/bundle-manifest.json'),'utf8'));
for(const [file,expected] of Object.entries(bundle)){
 const actual=createHash('sha256').update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).digest('hex');
 if(actual!==expected)throw Error('Firebase bundle is stale: '+file+'; run npm run build:firebase');
}
for(const name of ['live-price-data.js','peripheral-connections.js','peripheral-cables.js','peripheral-cables.css','catalog-budget.js','product-images-budget.js','foreign-prices.js','money.js','backgrounds.js','background-state.js','backgrounds.css','assets/backgrounds/room.jpg','assets/backgrounds/city-day.jpg','assets/backgrounds/city-night.jpg','peripherals-brands-data.js','peripherals-brands.js','keyboard-layout-brands.js','keyboard-model-brands.js','keyboard-controls-brands.js','mouse-model-brands.js','shop-catalog-brands.js','workplace-store-brands.js','keyboard-model.js','keyboard-layout.js','keyboard-controls.js','workplace-scene-v4.js','mouse-model.js','workplace-scene-v3.js','builder-ui.js','shop-catalog.js','workplace-store.js','builder-app.js','workplace-assembly.js','workplace-peripherals.js','workplace-integrated.css','workplace.html','workplace.css','workplace.js','workplace-page.js','workplace-scene.js','workplace-models.js','peripherals.js','peripherals-extra.js','peripheral-shapes.js','peripheral-images.json','price-quality.js','verification.js','verification-data.js','data-quality-ui.js','data-quality.css']){
 const file=path.join(root,'dist',name);if(!fs.existsSync(file))throw Error('Missing '+name);
 if(name.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
}
const evidence=spawnSync(process.execPath,[path.join(root,'scripts/build-verification.mjs'),'--check'],{encoding:'utf8'});
if(evidence.status!==0)throw Error(evidence.stderr);process.stdout.write(evidence.stdout);
for(const name of ['fullscreen.js','fullscreen.css','build-panel.js','build-panel.css','motion.js','thermal-panel.js','design-studio.css','market.html','market.js','market.css','navigation.js','navigation.css','regions.js','store-links-by.js','prices-by.json','catalog-extra.js','product-images-extra.js','aio.js','aio-model.js','gallery.css','firebase-config.json','vendor/firebase-gallery.js','budget-data.js','autobuild.js','autobuild-ui.js','autobuild-worker.js','autobuild.css','cooling.js','lighting.js','lighting-scene.js','fan-layout.js','fan-scene.js','fan-ui.js','fans.css','assets/concepts/panorama.svg','assets/concepts/dual.svg','assets/concepts/compact.svg','index.html','style.css','workbench.css','shop.css','shop.js','gpu-model.js','layout.js','cable-geometry.js','cooler-model.js','case-model.js','app.js','catalog.js','product-images.js','engine.js','scene.js','model.js','wiring.js','interaction.js','inspector.js','surfaces.js','ports.json','prices.json','sources.json','vendor/three.module.js','vendor/three.core.js','vendor/OrbitControls.js']){
 const file=path.join(root,'dist',name);if(!fs.existsSync(file))throw Error('Missing '+name);
 if(name.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
 if(name.endsWith('.json'))JSON.parse(fs.readFileSync(file,'utf8'));
}
for(const [region,file] of [['ru','prices.json'],['by','prices-by.json']]){
 const prices=JSON.parse(fs.readFileSync(path.join(root,'dist',file))),valid=priceSnapshot(prices,region);
 for(const [id,p] of Object.entries(prices.items)){
  if(!byId[id]||!valid.items[id]||!p.store||priceQuality(p).status==='invalid')throw Error('Invalid '+region+' offer '+id);
  if(p.availability&&!['in-stock','unknown','out-of-stock'].includes(p.availability))throw Error('Invalid availability '+id);
 }
}
const live=JSON.parse(fs.readFileSync(path.join(root,'dist/live-prices.json'),'utf8'));
if(live.schemaVersion!==1||!live.items||!live.checks)throw Error('Invalid live price schema');
for(const [region,items] of Object.entries(live.items))for(const [id,offer] of Object.entries(items)){
 if((!byId[id]&&!peripheralById[id])||!validLiveOffer(offer,region)||region==='by'&&!byStoreProduct(offer.url))throw Error('Invalid live offer '+region+':'+id);
}
for(const [region,checks] of Object.entries(live.checks))for(const [id,check] of Object.entries(checks)){
 if(!['ru','by','usd'].includes(region)||(!byId[id]&&!peripheralById[id])||!['updated','blocked','unavailable','unverified','error'].includes(check.status)||!Number.isFinite(Date.parse(check.attemptedAt)))throw Error('Invalid live price check '+region+':'+id);
}
for(const [id,offer] of Object.entries(foreignComponentOffers))if(!byId[id]||!validForeignOffer(offer))throw Error('Invalid USD component offer '+id);
for(const [id,offers] of Object.entries(peripheralOfferUpdates)){
 if(!peripheralById[id])throw Error('Unknown peripheral offer '+id);
 for(const [region,offer] of Object.entries(offers))if(!['ru','usd'].includes(region)||offer.currency!==(region==='usd'?'USD':'RUB')||priceQuality(offer).status==='invalid'||!validForeignOffer({...offer,currency:'USD'}))throw Error('Invalid peripheral offer '+id);
}
for(const [id,photo] of Object.entries(productImages)){
 if(!byId[id])throw Error('Unknown photo product '+id);
 if(!photo.image)continue;
 if(!/^assets\/catalog\/[a-z0-9-]+\.webp$/.test(photo.image)||!fs.existsSync(path.join(root,'dist',photo.image)))throw Error('Missing product photo '+id);
 if(!photo.sourcePage?.startsWith('https://')||!photo.sourceImage?.startsWith('https://'))throw Error('Missing photo attribution '+id);
}
console.log('Static files, JavaScript syntax, photo assets and price provenance checks passed.');
const tests=fs.readdirSync(path.join(root,'test')).filter(n=>n.endsWith('.test.js')).map(n=>path.join(root,'test',n));
const tested=spawnSync(process.execPath,['--test','--test-reporter=tap',...tests],{encoding:'utf8'});
if(tested.status!==0){process.stdout.write(tested.stdout);throw Error(tested.stderr||'Tests failed');}
console.log(tested.stdout.split('\n').filter(line=>/^# (tests|pass|fail|duration_ms) /.test(line)).join('\n'));
