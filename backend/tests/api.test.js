process.env.NODE_ENV = 'test';
import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import { createCaller } from './caller.js';

const request = createCaller(app);

let authToken;
let createdTaskId;

describe('🧪 Practical 12: Automated REST API Test Suite for CI Pipeline', () => {
  before(async () => {
    // Authenticate test user in-process
    const res = await request('post', '/api/auth/register', {
      body: {
        name: 'CI Pipeline Tester',
        email: `ci_test_${Date.now()}@example.com`,
        password: 'password123'
      }
    });
    authToken = res.body?.token;
  });

  test('1. Health Check Endpoint (GET /api/health) returns HTTP 200 and UP status', async () => {
    const res = await request('get', '/api/health');
    assert.strictEqual(res.statusCode, 200, 'Expected HTTP 200 for health endpoint');
    assert.strictEqual(res.body.status, 'UP', 'Service status must be UP');
    assert.ok(res.body.service.includes('Practical 12'), 'Service name must mention Practical 12');
  });

  test('2. Task Listing Endpoint (GET /api/tasks) returns HTTP 200 with tasks array', async () => {
    const res = await request('get', '/api/tasks', {
      headers: { authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(res.statusCode, 200, 'Expected HTTP 200 for task listing');
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data), 'data must be an array of tasks');
  });

  test('3. Task Creation Endpoint (POST /api/tasks) creates task with status 201', async () => {
    const res = await request('post', '/api/tasks', {
      headers: { authorization: `Bearer ${authToken}` },
      body: {
        title: 'CI Automated Integration Task',
        description: 'Verify GitHub Actions build and test runner',
        priority: 'high'
      }
    });
    assert.strictEqual(res.statusCode, 201, 'Expected HTTP 201 for task creation');
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'CI Automated Integration Task');
    createdTaskId = res.body.data._id || res.body.data.id;
    assert.ok(createdTaskId, 'Task must have a valid ID');
  });

  test('4. Task Deletion Endpoint (DELETE /api/tasks/:id) deletes task with status 200', async () => {
    assert.ok(createdTaskId, 'Must have task ID to delete');
    const res = await request('delete', `/api/tasks/${createdTaskId}`, {
      headers: { authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(res.statusCode, 200, 'Expected HTTP 200 for task deletion');
    assert.strictEqual(res.body.success, true);
  });
});
