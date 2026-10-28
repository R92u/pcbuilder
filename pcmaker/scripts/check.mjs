import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {byId} from '../dist/catalog.js';
import {productImages} from '../dist/product-images.js';
import {priceSnapshot} from '../dist/regions.js';
import {priceQuality} from '../dist/price-quality.js';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const bundle=JSON.parse(fs.readFileSync(path.join(root,'firebase/bundle-manifest.json'),'utf8'));
for(const [file,expected] of Object.entries(bundle)){
 const actual=createHash('sha256').update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).digest('hex');
 if(actual!==expected)throw Error('Firebase bundle is stale: '+file+'; run npm run build:firebase');
}
for(const name of ['price-quality.js','verification.js','verification-data.js','data-quality-ui.js','data-quality.css']){
 const file=path.join(root,'dist',name);if(!fs.existsSync(file))throw Error('Missing '+name);
 if(name.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
}
const evidence=spawnSync(process.execPath,[path.join(root,'scripts/build-verification.mjs'),'--check'],{encoding:'utf8'});
if(evidence.status!==0)throw Error(evidence.stderr);process.stdout.write(evidence.stdout);
for(const name of ['build-panel.js','build-panel.css','motion.js','thermal-panel.js','design-studio.css','market.html','market.js','market.css','navigation.js','navigation.css','regions.js','store-links-by.js','prices-by.json','catalog-extra.js','product-images-extra.js','aio.js','aio-model.js','gallery.css','firebase-config.json','vendor/firebase-gallery.js','budget-data.js','autobuild.js','autobuild-ui.js','autobuild-worker.js','autobuild.css','cooling.js','lighting.js','lighting-scene.js','fan-layout.js','fan-scene.js','fan-ui.js','fans.css','assets/concepts/panorama.svg','assets/concepts/dual.svg','assets/concepts/compact.svg','index.html','style.css','workbench.css','shop.css','shop.js','gpu-model.js','layout.js','cable-geometry.js','cooler-model.js','case-model.js','app.js','catalog.js','product-images.js','engine.js','scene.js','model.js','wiring.js','interaction.js','inspector.js','surfaces.js','ports.json','prices.json','sources.json','vendor/three.module.js','vendor/three.core.js','vendor/OrbitControls.js']){
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
