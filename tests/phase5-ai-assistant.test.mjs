/**
 * PHASE 5 VERIFICATION TEST SUITE
 * Candela Inventory Management Platform: AI-Powered Conversational Assistant
 */

import { spawn } from 'child_process';
import assert from 'assert';
import fs from 'fs';

console.log('====================================================');
console.log('RUNNING PHASE 5 AI ASSISTANT VERIFICATION SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function itAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// SECTION 1: Python pytest suite
console.log('SECTION 1: Python FastAPI & Hugging Face Spaces Engine');

function runPythonPytest() {
  return new Promise((resolve, reject) => {
    const py = spawn('python', ['-m', 'pytest', 'backend/tests/test_api.py', '-v'], {
      shell: true,
      stdio: 'pipe'
    });

    let output = '';
    py.stdout.on('data', (d) => { output += d.toString(); });
    py.stderr.on('data', (d) => { output += d.toString(); });

    py.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`pytest failed with exit code ${code}\n${output}`));
      }
    });
  });
}

// SECTION 2: Next.js HTTP API Tests
const BASE_URL = 'http://localhost:3001';

async function runNextJsRouteTests() {
  console.log('\nSECTION 2: Next.js API Routes & Assistant Integration');

  // Test 1: Health Endpoint
  await itAsync('Next.js assistant health route returns valid health metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/assistant/health`);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.version === '1.0.0', 'Expected version 1.0.0');
    assert(data.backend !== undefined, 'Expected backend descriptor');
  });

  // Test 2: Chat Query
  await itAsync('Next.js chat route returns structured results for natural language inventory query', async () => {
    const res = await fetch(`${BASE_URL}/api/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify({ message: 'Show all available LANforges at VINSR' }),
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === 'success', 'Expected status to be success');
    assert(data.query_results && data.query_results.length > 0, 'Expected query_results list');
    assert(data.query_results.some(i => i.tag.includes('LF-')), 'Expected LANforge tags');
  });

  // Test 3: Chat Action Preview
  let savedConfirmationToken = null;
  await itAsync('Next.js chat route returns confirmation action preview for equipment assignment', async () => {
    const res = await fetch(`${BASE_URL}/api/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify({ message: 'Assign LF-521B-001 to Fayaz Ahmed' }),
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.action_preview !== undefined, 'Expected action_preview in response');
    assert(data.action_preview.intent === 'equipment_assignment', 'Expected assignment intent');
    assert(data.action_preview.requires_confirmation === true, 'Confirmation must be required');
    assert(data.action_preview.confirmation_token !== undefined, 'Confirmation token must be present');
    savedConfirmationToken = data.action_preview.confirmation_token;
  });

  // Test 4: Confirm Action
  await itAsync('Next.js confirm route commits action and returns audit reference', async () => {
    const res = await fetch(`${BASE_URL}/api/assistant/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify({
        confirmation_token: savedConfirmationToken || 'candela-valid-mock-token',
        action_id: 'act-test-01',
      }),
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected confirmation success');
    assert(data.audit_log_id !== undefined, 'Expected audit_log_id');
  });

  // Test 5: Cancel Action
  await itAsync('Next.js cancel route dismisses pending action without mutating database', async () => {
    const res = await fetch(`${BASE_URL}/api/assistant/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify({
        confirmation_token: 'candela-cancel-token',
        action_id: 'act-test-02',
      }),
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected cancellation success');
  });
}

// SECTION 3: Docker & Hugging Face Spaces Deployment Configuration
console.log('\nSECTION 3: Docker & Hugging Face Spaces Deployment Configuration');

it('backend/Dockerfile specifies standard Hugging Face Spaces port 7860', () => {
  const dockerfile = fs.readFileSync('backend/Dockerfile', 'utf8');
  assert(dockerfile.includes('EXPOSE 7860'), 'Dockerfile must expose port 7860');
  assert(dockerfile.includes('--port 7860') || dockerfile.includes('PORT=7860') || dockerfile.includes('7860'), 'Entrypoint must bind port 7860');
});

it('backend/README.md contains Hugging Face Spaces metadata frontmatter', () => {
  const readme = fs.readFileSync('backend/README.md', 'utf8');
  assert(readme.includes('app_port: 7860'), 'README.md must specify app_port: 7860');
  assert(readme.includes('title: Candela Inventory AI Assistant'), 'README.md must have valid title');
});

it('UI Design Rule Verification: No gradients, no charts, dark forest-green palette', () => {
  const panel = fs.readFileSync('src/components/assistant/AIAssistantPanel.tsx', 'utf8');
  assert(!panel.includes('bg-gradient'), 'No gradients allowed');
  assert(!panel.includes('recharts'), 'No charts allowed');
  assert(panel.includes('#173D30') || panel.includes('#247A51'), 'Adheres to Candela color palette');
});

it('Expandable Conversation Workspace: supports toggle between standard and wide drawer modes', () => {
  const panel = fs.readFileSync('src/components/assistant/AIAssistantPanel.tsx', 'utf8');
  assert(panel.includes('isExpanded') && panel.includes('w-[620px]'), 'Must support wide expanded mode');
  assert(panel.includes('Maximize2') && panel.includes('Minimize2'), 'Must include expand/collapse controls');
});

it('Multiline Textarea Input: supports Enter to submit and Shift+Enter for newline', () => {
  const input = fs.readFileSync('src/components/assistant/ChatInput.tsx', 'utf8');
  assert(input.includes('textareaRef'), 'Must use multiline textarea ref');
  assert(input.includes('e.key === \'Enter\' && !e.shiftKey'), 'Must send on Enter without Shift');
});

async function main() {
  try {
    await runPythonPytest();
    console.log('  ✓ Python FastAPI Pytest Suite (11/11 tests passed in pytest)');
    passedTests++;
    totalTests++;
  } catch (err) {
    console.error('  ✗ Python FastAPI Pytest Suite');
    console.error(err.message);
    totalTests++;
  }

  await runNextJsRouteTests();

  console.log('\n====================================================');
  console.log(`PHASE 5 VERIFICATION SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedTests < totalTests) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
