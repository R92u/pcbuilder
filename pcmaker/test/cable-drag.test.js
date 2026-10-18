import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector2,Vector3} from '../dist/vendor/three.module.js';
import {demoBuild} from '../dist/catalog.js';
import {cablesFor} from '../dist/wiring.js';
import {beginCableDrag,cableDragPoint,cablePreviewPoints,cableCurve} from '../dist/cable-geometry.js';

test('Dragging starts at each physical socket without a jump at side, front and rear angles',()=>{
 const cables=cablesFor({...demoBuild,cooler:'aio-le240-v2'});
 for(const position of [[10,5,4],[0,3,10],[-9,4,5],[3,4,-9]]){
  const camera=new PerspectiveCamera(36,1.5,.1,70);camera.position.set(...position);camera.lookAt(0,2.3,0);camera.updateMatrixWorld();
  for(const cable of cables){
   const source=new Vector3(...cable.points[0]),screen=source.clone().project(camera),pointer=new Vector2(screen.x+.01,screen.y-.01);
   const drag=beginCableDrag(camera,source,pointer),initial=cableDragPoint(camera,pointer,drag);
   assert.ok(initial.distanceTo(source)<1e-9,cable.id);
   const nextPointer=pointer.clone().add(new Vector2(.12,-.08)),end=cableDragPoint(camera,nextPointer,drag),projected=end.clone().project(camera);
   assert.ok(end.toArray().every(Number.isFinite));
   assert.ok(Math.abs(projected.x-screen.x-.12)<1e-9,cable.id+' follows pointer horizontally');
   assert.ok(Math.abs(projected.y-screen.y+.08)<1e-9,cable.id+' follows pointer vertically');
   const preview=cableCurve(cablePreviewPoints(cable,end));
   assert.ok(preview.getPoint(0).distanceTo(source)<1e-9);
   assert.ok(preview.getPoint(1).distanceTo(end)<1e-9);
  }
 }
});

test('Snapping previews the installed route between the same two physical connectors',()=>{
 for(const cable of cablesFor({...demoBuild,gpu:'rtx3090'})){
  const target=new Vector3(...cable.points.at(-1));
  const route=cablePreviewPoints(cable,target,true),curve=cableCurve(route);
  assert.deepEqual(route.map(v=>v.toArray()),cable.points);
  assert.ok(curve.getPoint(0).distanceTo(new Vector3(...cable.points[0]))<1e-9);
  assert.ok(curve.getPoint(1).distanceTo(target)<1e-9);
 }
});
