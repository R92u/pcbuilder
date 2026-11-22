import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene, PerspectiveCamera, Vector3} from '../dist/vendor/three.module.js';
import {CableFlight} from '../dist/cable-flight.js';

function setup(){
  const scene=new Scene(),camera=new PerspectiveCamera(),controls={target:new Vector3(6,8,1)};
  camera.position.set(10,14,20);camera.lookAt(controls.target);
  return {scene,camera,controls,flight:new CableFlight(scene,camera,controls)};
}
test('camera follows the world-space installed cable to its socket and restores the exact view',()=>{
  const {scene,camera,controls,flight}=setup(),start=camera.position.clone(),rotation=camera.quaternion.clone(),target=controls.target.clone();
  const path=[[3,8,-4],[3,8,2],[5,9,2]];
  flight.start(path,0);
  flight.update(450);
  const tip=flight.active.tip.position;
  assert.equal(tip.x,3);assert.equal(tip.y,8);assert.ok(tip.z>-4 && tip.z<2);
  flight.update(920);
  assert.deepEqual(controls.target.toArray(),path.at(-1));
  assert.notDeepEqual(camera.position.toArray(),start.toArray());
  flight.update(1400);
  assert.ok(camera.position.equals(start)&&camera.quaternion.equals(rotation)&&controls.target.equals(target));
  assert.equal(scene.children.length,0);
});
test('cancel, rapid reconnect, disabled preference and degenerate routes leave no overlay',()=>{
  const {scene,camera,flight}=setup(),start=camera.position.clone();
  flight.start([[0,0,0],[1,2,3]],0);flight.update(380);
  flight.start([[0,1,0],[2,2,2]],400);assert.equal(scene.children.length,1);
  flight.cancel();assert.ok(camera.position.equals(start));
  flight.start([[1,0,0],[1,0,0]],0);assert.equal(scene.children.length,0);
  flight.enabled=false;flight.start([[0,0,0],[4,3,1]],0);assert.equal(flight.update(10),false);
});
