import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';

// Exercise the real scene loop without a DOM or a GPU. A renderer resize
// invalidates its drawing buffer, as WebGL does in the browser.
const hooks=registerHooks({resolve(specifier,context,next){
 return next(specifier==='three'?new URL('../dist/vendor/three.module.js',import.meta.url).href:specifier,context);
}});
const {PCScene}=await import('../dist/scene.js');
const {WorkplaceScene}=await import('../dist/workplace-scene-v4.js');
hooks.deregister();

function harness(Scene=PCScene){
 let rect={width:800,height:600},pixels='computer';const events=[];
 const scene=Object.assign(Object.create(Scene.prototype),{
  container:{getBoundingClientRect:()=>rect},viewportWidth:800,viewportHeight:600,
  camera:{aspect:4/3,updateProjectionMatrix(){events.push('projection');}},
  renderer:{setSize(w,h){pixels=null;events.push(['resize',w,h]);},render(){pixels='computer';events.push('render');}},
  controls:{update(){}},cableFlight:{cancel(){},update(){return false;}},fitCaseView(){events.push('fit');},updateFanMarkers(){},updateMarkers(){},
  fans:[],transitions:[],last:100,scene:{},frame(){},
 });
 return {scene,events,setRect(value){rect=value;},get pixels(){return pixels;}};
}
function frame(scene,time,Scene=PCScene){
 const previous=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=()=>1;
 try{Scene.prototype.frame.call(scene,time);}finally{if(previous)globalThis.requestAnimationFrame=previous;else delete globalThis.requestAnimationFrame;}
}

for(const Scene of [PCScene,WorkplaceScene])test(`${Scene.name}: resize never leaves an empty drawing buffer between frames`,()=>{
 const h=harness(Scene);
 // Simulate repeated ResizeObserver deliveries after the last rendered frame.
 for(const width of [840,930,1060]){h.setRect({width,height:600});h.scene.resize();assert.equal(h.pixels,'computer');}
 assert.deepEqual(h.events,[]);
 frame(h.scene,110,Scene); // Only 10 ms: normally skipped by the 45 FPS cap.
 assert.deepEqual(h.events,['projection',['resize',1060,600],'fit','render']);
 assert.equal(h.pixels,'computer');assert.equal(h.scene.camera.aspect,1060/600);
 // The reverse panel animation and fullscreen height change use the same path.
 h.events.length=0;h.setRect({width:800,height:720});h.scene.resize();frame(h.scene,120,Scene);
 assert.deepEqual(h.events,['projection',['resize',800,720],'fit','render']);assert.equal(h.pixels,'computer');
 h.events.length=0;frame(h.scene,125,Scene);assert.deepEqual(h.events,[]); // cap restored
});

test('unchanged, subpixel and hidden viewport sizes do not erase the canvas',()=>{
 const h=harness();
 for(const rect of [{width:800.1,height:600.2},{width:0,height:0},{width:NaN,height:600}]){
  h.setRect(rect);h.scene.resize();frame(h.scene,110);assert.equal(h.pixels,'computer');
 }
 assert.deepEqual(h.events,[]);
 h.setRect({width:1000,height:600});h.scene.resize();
 h.setRect({width:800,height:600});h.scene.resize();frame(h.scene,110);
 assert.deepEqual(h.events,[]);assert.equal(h.pixels,'computer');
});
