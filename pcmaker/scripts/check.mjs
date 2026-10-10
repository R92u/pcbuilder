import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {byId} from '../dist/catalog.js';
import {productImages} from '../dist/product-images.js';
const root=path.resolve(import.meta.dirname,'..');
for(const name of ['fan-layout.js','fan-scene.js','fan-ui.js','fans.css','assets/concepts/panorama.svg','assets/concepts/dual.svg','assets/concepts/compact.svg','index.html','style.css','workbench.css','shop.css','shop.js','gpu-model.js','layout.js','cable-geometry.js','cooler-model.js','case-model.js','app.js','catalog.js','product-images.js','engine.js','scene.js','model.js','wiring.js','interaction.js','inspector.js','surfaces.js','ports.json','prices.json','sources.json','vendor/three.module.js','vendor/three.core.js','vendor/OrbitControls.js']){
 const file=path.join(root,'dist',name);if(!fs.existsSync(file))throw Error('Missing '+name);
 if(name.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
 if(name.endsWith('.json'))JSON.parse(fs.readFileSync(file,'utf8'));
}
const prices=JSON.parse(fs.readFileSync(path.join(root,'dist/prices.json')));
for(const [id,p] of Object.entries(prices.items)){if(!Number.isFinite(p.price)||p.price<=0||!p.date||!p.store||!p.url?.startsWith('https://'))throw Error('Incomplete verified price '+id);}
for(const [id,photo] of Object.entries(productImages)){
 if(!byId[id])throw Error('Unknown photo product '+id);
 if(!photo.image)continue;
 if(!/^assets\/catalog\/[a-z0-9-]+\.webp$/.test(photo.image)||!fs.existsSync(path.join(root,'dist',photo.image)))throw Error('Missing product photo '+id);
 if(!photo.sourcePage?.startsWith('https://')||!photo.sourceImage?.startsWith('https://'))throw Error('Missing photo attribution '+id);
}
console.log('Static files, JavaScript syntax, photo assets and price provenance checks passed.');
