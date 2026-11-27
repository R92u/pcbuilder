import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {PerspectiveCamera} from '../dist/vendor/three.module.js';

const hooks = registerHooks({resolve(specifier, context, next) {
  return next(specifier === 'three' ? new URL('../dist/vendor/three.module.js', import.meta.url).href : specifier, context);
}});
const {CameraControls} = await import('../dist/camera-controls.js');
hooks.deregister();

function setup() {
  const camera = new PerspectiveCamera();
  camera.position.set(0, 0, 10);
  const controls = new CameraControls(camera, null);
  controls.minDistance = 4;
  controls.maxDistance = 20;
  return controls;
}

test('orbit and dolly ease over elapsed time regardless of frame or event rate', () => {
  function simulate(frames, events) {
    const c = setup();
    for (let n = 0; n < events; n++) {
      c.rotateLeft(0.8 / events);
      c.dollyOut(0.6 ** (1 / events));
    }
    assert.equal(c.getDistance(), 10);
    assert.equal(c.getAzimuthalAngle(), 0);
    for (let n = 0; n < frames; n++) c.update(0.1 / frames);
    return [c.getAzimuthalAngle(), c.getDistance()];
  }
  const [angle, distance] = simulate(3, 1);
  assert.ok(angle < 0 && angle > -0.8);
  assert.ok(distance > 10 && distance < 10 / 0.6);
  const frequent = simulate(12, 16);
  assert.ok(Math.abs(frequent[0] - angle) < 1e-9);
  assert.ok(Math.abs(frequent[1] - distance) < 1e-9);
});

test('reversing zoom reacts immediately and presets discard pending movement', () => {
  const c = setup();
  c.dollyOut(0.02);
  c.update(0.03);
  const atReversal = c.getDistance();
  c.dollyIn(0.8);
  c.update(0.03);
  assert.ok(c.getDistance() < atReversal);
  c.rotateLeft(1);
  c.stopMotion();
  c.object.position.set(8, 0, 0);
  c.update();
  for (let i = 0; i < 30; i++) c.update(1 / 30);
  assert.ok(Math.abs(c.getDistance() - 8) < 1e-9);
  assert.ok(Math.abs(c.getAzimuthalAngle() - Math.PI / 2) < 1e-9);
});

test('zoom settles at both limits and reduced motion applies input in one frame', () => {
  const c = setup();
  c.dollyOut(0.01);
  for (let i = 0; i < 80; i++) {
    c.update(1 / 30);
    assert.ok(c.getDistance() <= 20 + 1e-9);
  }
  assert.ok(Math.abs(c.getDistance() - 20) < 1e-9);
  assert.equal(c.update(1 / 30), false);
  c.dollyIn(0.01);
  c.rotateLeft(0.4);
  c.update(1 / 60, true);
  assert.ok(Math.abs(c.getDistance() - 4) < 1e-9);
  assert.ok(Math.abs(c.getAzimuthalAngle() + 0.4) < 1e-9);
  assert.equal(c.update(1 / 60), false);
});
