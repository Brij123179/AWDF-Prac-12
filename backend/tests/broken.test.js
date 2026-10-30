process.env.NODE_ENV = 'test';
import { test, describe } from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import { createCaller } from './caller.js';

const request = createCaller(app);

describe('🧪 Practical 12: Deliberately Broken Test (Simulating CI Pipeline Failure - Red X)', () => {
  test('Deliberate Failure: Expecting status 500 from healthy GET /api/health', async () => {
    const res = await request('get', '/api/health');
    console.log(`   [Deliberate Failure Check] Received real status: ${res.statusCode}, asserting expected: 500`);
    // Intentionally wrong assertion to demonstrate CI failure in lab session Step 5
    assert.strictEqual(res.statusCode, 500, 'DELIBERATE TEST FAILURE: Health endpoint returned 200 instead of expected 500');
  });
});
