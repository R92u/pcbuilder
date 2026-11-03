import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sanitizeBackground,backgroundAsset,imageSize,backgroundDefaults} from '../dist/background-state.js';

test('damaged saved background preferences cannot introduce URLs or unbounded filters',()=>{
 for(const value of [null,undefined,[],42,'bad'])assert.deepEqual(sanitizeBackground(value),backgroundDefaults);
 assert.deepEqual(sanitizeBackground({preset:'https://example.com/image.jpg',city:'invalid',blur:Infinity,brightness:-50}),{preset:'dark',city:'day',blur:2,brightness:40});
 assert.equal(backgroundAsset({preset:'custom',url:'https://example.com/track'}),null);
 assert.equal(sanitizeBackground({preset:'room',blur:500,brightness:500}).blur,20);
 assert.equal(sanitizeBackground({brightness:500}).brightness,130);
});
test('imported photos retain proportions within the memory budget without enlarging small files',()=>{
 assert.deepEqual(imageSize(6000,4000),{width:1920,height:1280});
 assert.deepEqual(imageSize(1000,5000),{width:384,height:1920});
 assert.deepEqual(imageSize(640,480),{width:640,height:480});
 for(const [w,h] of [[0,50],[50000,50000],[NaN,10],[10,Infinity]])assert.throws(()=>imageSize(w,h));
});
test('all built-in photo backgrounds are shipped locally with a small transfer size',()=>{
 const assets=[backgroundAsset({preset:'room'}),backgroundAsset({preset:'city',city:'day'}),backgroundAsset({preset:'city',city:'night'})];
 assert.equal(new Set(assets).size,3);
 for(const asset of assets){const size=fs.statSync(new URL('../dist/'+asset,import.meta.url)).size;assert.ok(size>10000&&size<300000);}
});
