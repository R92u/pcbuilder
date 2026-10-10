import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
for(const name of ['index.html','style.css','app.js','catalog.js','engine.js','scene.js','model.js','wiring.js','interaction.js','inspector.js','surfaces.js','ports.json','prices.json','sources.json','vendor/three.module.js','vendor/three.core.js','vendor/OrbitControls.js']){
 const file=path.join(root,'dist',name);if(!fs.existsSync(file))throw Error('Missing '+name);
 if(name.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}
 if(name.endsWith('.json'))JSON.parse(fs.readFileSync(file,'utf8'));
}
const prices=JSON.parse(fs.readFileSync(path.join(root,'dist/prices.json')));
for(const [id,p] of Object.entries(prices.items)){if(!Number.isFinite(p.price)||p.price<=0||!p.date||!p.store||!p.url?.startsWith('https://'))throw Error('Incomplete verified price '+id);}
console.log('Static files, JavaScript syntax and price provenance checks passed.');
