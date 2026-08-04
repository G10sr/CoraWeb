import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

test('la app express se crea y expone rutas básicas', () => {
  assert.equal(typeof app.listen, 'function');
  assert.equal(typeof app.handle, 'function');
});
