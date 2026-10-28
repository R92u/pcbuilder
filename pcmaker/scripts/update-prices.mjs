// Import a manually verified price snapshot; never guess missing prices.
import fs from 'node:fs';
import path from 'node:path';
import {byId} from '../dist/catalog.js';
import {priceSnapshot,regionFor} from '../dist/regions.js';
import {priceQuality} from '../dist/price-quality.js';
const file=process.argv[2];if(!file)throw Error('Usage: node scripts/update-prices.mjs snapshot.json');
const data=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));
const region=regionFor(data.region||(data.currency==='BYN'?'by':'ru'));
if(data.city!==region.city||!data.items||Array.isArray(data.items)||typeof data.items!=='object')throw Error('Expected regional snapshot with items');
const validated=priceSnapshot(data,region.id);
for(const [id,p] of Object.entries(data.items)){
 if(!byId[id])throw Error('Unknown part '+id);
 if(!validated.items[id]||!p.store||priceQuality(p).status==='invalid')throw Error('Invalid price, currency, date or store URL for '+id);
}
// Merge a reviewed batch without silently deleting offers absent from that batch.
const target=path.resolve(import.meta.dirname,'../dist/'+region.file),previous=JSON.parse(fs.readFileSync(target,'utf8'));
const merged={...previous,region:region.id,currency:region.currency,city:region.city,updatedAt:new Date().toISOString().slice(0,10),items:{...previous.items,...validated.items}};
fs.writeFileSync(target,JSON.stringify(merged,null,2)+'\n');console.log(`Imported ${Object.keys(validated.items).length} reviewed ${region.currency} offers; individual check dates preserved.`);
