// Import a manually verified price snapshot; never guess missing prices.
import fs from 'node:fs';
import path from 'node:path';
import {byId} from '../dist/catalog.js';
const file=process.argv[2];if(!file)throw Error('Usage: node scripts/update-prices.mjs snapshot.json');
const data=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));
if(data.city!=='Москва'||!data.items||typeof data.items!=='object')throw Error('Expected Moscow price snapshot with items');
for(const [id,p] of Object.entries(data.items)){if(!byId[id])throw Error('Unknown part '+id);if(!Number.isFinite(p.price)||p.price<=0||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!p.store||!p.url?.startsWith('https://'))throw Error('Missing price, date, store or URL for '+id);}
fs.writeFileSync(path.resolve(import.meta.dirname,'../dist/prices.json'),JSON.stringify(data,null,2)+'\n');console.log(`Imported ${Object.keys(data.items).length} verified price entries.`);
