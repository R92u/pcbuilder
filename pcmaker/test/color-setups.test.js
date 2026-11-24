import test from 'node:test';
import assert from 'node:assert/strict';
import {byId, demoBuild, emptyBuild} from '../dist/catalog.js';
import {compatibility} from '../dist/engine.js';
import {peripheralById} from '../dist/peripherals.js';
import {pickColorSetup, SETUP_PALETTES} from '../dist/color-setups.js';

test('every palette is a complete installable PC and desk from an empty build', () => {
  for (const {id} of SETUP_PALETTES) {
    const start = Object.freeze(emptyBuild());
    const setup = pickColorSetup(id, start);
    assert.equal(compatibility(setup.build).ready, true, id);
    assert.equal(setup.addedInternals.length, 7);
    assert.deepEqual(Object.keys(setup.selection).sort(), ['chair','keyboard','mat','monitor','mouse']);
    for (const [category, part] of Object.entries(setup.selection)) {
      assert.equal(peripheralById[part]?.category, category);
    }
    for (const part of setup.addedInternals) assert.equal(byId[setup.build[part.category]].id, part.id);
    assert.ok(setup.items.some(i => ['exact', 'accent'].includes(i.match)), id);
    assert.deepEqual(start, emptyBuild());
    assert.deepEqual(pickColorSetup(id, setup.build, setup.selection).selection, setup.selection);
  }
  assert.equal(pickColorSetup('unknown', emptyBuild()), null);
});

test('catalog accents and neutral substitutes are distinguished from the requested finish', () => {
  const preview = pickColorSetup('red', demoBuild);
  assert.equal(preview.items.find(i => i.category === 'case').match, 'exact');
  assert.equal(preview.items.find(i => i.category === 'keyboard').match, 'accent');
  assert.equal(preview.items.find(i => i.category === 'mouse').match, 'exact');
  for (const [tone, match] of [['green','accent'], ['red','accent'], ['blue','exact'], ['pink','exact']]) {
    assert.equal(pickColorSetup(tone, demoBuild).items.find(i => i.category === 'chair').match, match);
  }
  assert.equal(pickColorSetup('white', demoBuild).items.find(i => i.category === 'monitor').match, 'exact');
});

test('color selection respects a 360 mm radiator and preserves an unfinished build', () => {
  const start = {...emptyBuild(), cooler:'aio-le360-v2', case:'pop-air-white'};
  assert.ok(compatibility(start).errors.some(error => error.code === 'radiator-size'));
  const preview = pickColorSetup('white', start);
  assert.equal(preview.build.cooler, start.cooler);
  assert.deepEqual(preview.addedInternals, []);
  assert.equal(preview.build.cpu, null);
  assert.notEqual(preview.build.case, start.case);
  assert.deepEqual(compatibility(preview.build).errors, []);
});

test('local edits survive a palette change even with pre-existing socket conflicts', () => {
  const input = {...demoBuild, cpu:'r5-5600'};
  const before = compatibility(input);
  assert.ok(before.errors.some(e => e.code === 'socket'));
  const preview = pickColorSetup('white', input);
  const {case: beforeCase, ...previous} = input, {case: afterCase, ...result} = preview.build;
  assert.notEqual(beforeCase, afterCase);
  assert.deepEqual(result, previous);
  assert.deepEqual(preview.addedInternals, []);
  assert.deepEqual(compatibility(preview.build).errors, before.errors);
});
