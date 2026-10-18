import test from 'node:test';
import assert from 'node:assert/strict';
import {demoBuild,byId,catalog} from '../dist/catalog.js';
import {coolingAnalysis} from '../dist/cooling.js';
import {thermalTargets} from '../dist/engine.js';
import {defaultFanLayout} from '../dist/fan-layout.js';
import {caseLighting,gpuLighting,sanitizeLighting,lightingSources} from '../dist/lighting.js';
import {lightingSceneMethods} from '../dist/lighting-scene.js';
import {Group,Mesh,BoxGeometry,MeshStandardMaterial,Texture} from '../dist/vendor/three.module.js';
const build={...demoBuild,case:'pcmaker-dual'},settings={load:'game',ambient:22,front:60,rear:60,cpuFan:60};
const pair=(a,b)=>[{id:'fan1',slot:a,direction:'in'},{id:'fan2',slot:b,direction:'out'}];
const codes=analysis=>analysis.warnings.map(w=>w.code);
test('Moving the same two fans to a short path reduces exchange and increases heat',()=>{
 const good=thermalTargets(build,{...settings,fanLayout:pair('front-2','rear-3')}),bad=thermalTargets(build,{...settings,fanLayout:pair('front-2','front-3')});
 assert.ok(!codes(good.cooling).includes('short-path'));assert.ok(codes(bad.cooling).includes('short-path'));
 assert.ok(bad.flow<good.flow);assert.ok(bad.case>good.case);assert.ok(bad.gpu>good.gpu);
});
test('Rear intake against the tower cooler raises CPU thermal resistance',()=>{
 const good=thermalTargets(build,{...settings,fanLayout:pair('front-2','rear-3')}),bad=thermalTargets(build,{...settings,fanLayout:pair('rear-3','front-2')});
 assert.ok(codes(bad.cooling).includes('cooler-counterflow'));assert.ok(bad.cpu>good.cpu);
});
test('All-in, all-out, zero fans and zero RPM report distinct actionable warnings',()=>{
 const normal=defaultFanLayout(build);
 assert.ok(codes(coolingAnalysis(build,{...settings,fanLayout:normal.map(f=>({...f,direction:'in'}))})).includes('no-exhaust'));
 assert.ok(codes(coolingAnalysis(build,{...settings,fanLayout:normal.map(f=>({...f,direction:'out'}))})).includes('no-intake'));
 assert.ok(codes(coolingAnalysis(build,{...settings,fanLayout:[]})).includes('no-fans'));
 assert.ok(codes(coolingAnalysis(build,{...settings,front:0,rear:0})).includes('stopped'));
 assert.ok(codes(coolingAnalysis(build,{...settings,cpuFan:0})).includes('cpu-stopped'));
 assert.deepEqual(codes(coolingAnalysis(build,{...settings,fanLayout:normal})),[]);
});
test('Warnings clear after correction and RPM changes affect diagnosis before running',()=>{
 assert.ok(codes(coolingAnalysis(build,{...settings,front:0})).includes('no-intake'));
 assert.deepEqual(codes(coolingAnalysis(build,settings)),[]);
 for(const p of catalog.case){const b={...demoBuild,case:p.id};for(const speed of [0,5,100]){const result=thermalTargets(b,{...settings,front:speed,rear:speed});assert.ok(Number.isFinite(result.case));assert.ok(result.flow>=0);}}
});
test('Only exact lighted variants get RGB; fixed LEDs retain their actual color',()=>{
 assert.equal(caseLighting(byId['ch560-white']).type,'rgb');
 assert.deepEqual(caseLighting(byId.cc560),{type:'fixed',color:'#39c4c4',zones:'blades'});
 for(const id of ['4000d-airflow','pop-air','pop-air-white','h7-flow'])assert.equal(caseLighting(byId[id]),null);
 for(const p of catalog.gpu){assert.equal(!!gpuLighting(p),p.id==='rtx3090');if(gpuLighting(p))assert.ok(lightingSources[p.id]);}
 for(const p of catalog.case.filter(p=>p.concept))assert.equal(caseLighting(p).type,'rgb');
 assert.deepEqual(sanitizeLighting({mode:'bad',color:'url(evil)'}),{mode:'color',color:'#e4edff'});
 assert.deepEqual(sanitizeLighting({mode:'off',color:'#123456'}),{mode:'off',color:'#123456'});
});
test('Lighted surfaces switch off, animate, restore color and drop removed materials',()=>{
 const scene={...lightingSceneMethods,root:new Group()},rgb=new Mesh(new BoxGeometry(),new MeshStandardMaterial({map:new Texture()})),fixed=new Mesh(new BoxGeometry(),new MeshStandardMaterial()),plain=new Mesh(new BoxGeometry(),new MeshStandardMaterial());
 scene.root.add(rgb,fixed,plain);scene.tagLight(rgb,{type:'rgb'});scene.tagLight(fixed,{type:'fixed',color:'#39c4c4'});scene.collectLights();
 scene.setLighting({mode:'color',color:'#ff0000'});assert.equal(rgb.material.emissive.getHexString(),'ff0000');assert.equal(fixed.material.emissive.getHexString(),'39c4c4');assert.equal(plain.material.emissiveIntensity,1);
 scene.setLighting({mode:'off'});assert.equal(rgb.material.emissiveIntensity,0);assert.equal(fixed.material.emissiveIntensity,0);
 scene.setLighting({mode:'rainbow'});scene.updateLighting(100);const before=rgb.material.emissive.getHex();scene.updateLighting(3000);assert.notEqual(before,rgb.material.emissive.getHex());assert.equal(fixed.material.emissive.getHexString(),'39c4c4');
 rgb.removeFromParent();scene.collectLights();assert.equal(scene.lightMaterials.length,1);
});
