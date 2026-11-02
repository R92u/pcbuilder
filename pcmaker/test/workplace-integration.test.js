import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=name=>readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');

test('Workplace retains every builder control without duplicate identifiers',()=>{
 const original=html('index.html'),workplace=html('workplace.html');
 const ids=s=>[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const all=ids(workplace);
 assert.equal(new Set(all).size,all.length,'Each control has exactly one target');
 for(const id of ids(original))assert.ok(all.includes(id),'Missing builder control: '+id);
 for(const page of [original,workplace])assert.match(page,/src="\.\/builder-app\.js(?:\?[^"]*)?"/);
 assert.match(workplace,/id="computer-panel"/);
 assert.match(workplace,/id="peripherals-panel"/);
 assert.doesNotMatch(workplace,/id="workplace-products"/);
 assert.match(workplace,/id="shop-color"/);
 assert.match(workplace,/class="round-button github-link"[^>]*><svg/);
 assert.doesNotMatch(workplace,/class="workplace-heading"/);
 assert.doesNotMatch(workplace,/Сравни размеры\. Собери свой сетап/);
 assert.doesNotMatch(workplace,/data-category="(?:monitor|keyboard|mouse)"/,'Peripheral tabs must not open the PC store');
});
