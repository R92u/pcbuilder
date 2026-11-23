import test from 'node:test';
import assert from 'node:assert/strict';
import {backgroundTone,imageLuminance,createBackgroundContrast} from '../dist/background-contrast.js';

test('background contrast responds to actual image luminance and the brightness control',()=>{
 assert.equal(backgroundTone([255,255,255,255],100),'light');
 assert.equal(backgroundTone([20,25,30,255],130),'dark');
 assert.equal(backgroundTone([215,222,227,255],40),'dark');
 assert.equal(backgroundTone([215,222,227,255],100),'light');
 assert.equal(imageLuminance([255,255,255,0,0,0,0,255]),0);
 assert.equal(imageLuminance([255,255,255,255]),1);
});

test('an older image load cannot overwrite the newly selected background contrast',async()=>{
 const oldImage=globalThis.Image,oldDocument=globalThis.document,images=[];
 globalThis.Image=class {constructor(){images.push(this);}};
 globalThis.document={createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:[255,255,255,255]})})})};
 try{
  const root={dataset:{}},update=createBackgroundContrast(root);
  const pending=update({preset:'custom',brightness:100},'blob:old');
  await update({preset:'dark',brightness:100},null);
  images[0].onload();await pending;
  assert.equal(root.dataset.backgroundTone,'dark');
  await update({preset:'custom',brightness:100},'blob:old');
  assert.equal(root.dataset.backgroundTone,'light');
  assert.equal(images.length,1);
 }finally{globalThis.Image=oldImage;globalThis.document=oldDocument;}
});
