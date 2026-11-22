import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from '../dist/catalog.js';
import {compatibility} from '../dist/engine.js';
import {buildCart} from '../dist/shopping-cart.js';

test('all eight selected models become distinct cart lines, including a single RAM kit', () => {
  const build = {cpu:'r5-5600', motherboard:'a520m-a-pro', gpu:'rtx5060-ventus2x-oc',
    ram:'viper-steel-16-3200', storage:'nv3-1tb', cooler:'aio-le240-v2', psu:'pk700d', case:'ch560-white'};
  assert.equal(compatibility(build).ready, true);
  const cart = buildCart(resolve(build));
  const url = new URL(cart.url);
  assert.deepEqual(cart.missing, []);
  assert.equal(cart.count, 8);
  assert.equal(url.origin, 'https://e-techno.net');
  assert.equal(url.pathname, '/checkout-link/');
  const lines = url.searchParams.get('products').split(',');
  assert.equal(new Set(lines).size, 8);
  assert.ok(lines.every(line => /^\d+:1$/.test(line)));
});

test('missing parts stay visible and never create an empty external cart', () => {
  const parts = resolve({case:'cc560'});
  const empty = buildCart(parts);
  assert.equal(empty.url, null);
  assert.deepEqual(empty.missing, [{category:'case', part:parts.case}]);
  const mixed = buildCart(resolve({cpu:'r5-5600', case:'cc560'}));
  assert.equal(mixed.count, 1);
  assert.deepEqual(mixed.missing, empty.missing);
  assert.equal(new URL(mixed.url).searchParams.get('products'), '22546:1');
});
