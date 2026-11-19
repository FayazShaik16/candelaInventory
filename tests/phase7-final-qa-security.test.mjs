/**
 * PHASE 7 — FINAL QUALITY ASSURANCE, SECURITY AUDIT & PRODUCTION RELIABILITY SUITE
 * Candela Inventory Management Platform
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const BASE_URL_NEXT = 'http://localhost:3001';
const BASE_URL_AI = 'http://127.0.0.1:8000';

let totalTests = 0;
let passedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures.push({ name, error: err.message });
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures.push({ name, error: err.message });
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log('====================================================');
console.log('RUNNING PHASE 7 COMPLETE QA, SECURITY & RELIABILITY SUITE');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: AUTHENTICATION, AUTHORIZATION & ACCESS CONTROL
// -----------------------------------------------------------------------------
console.log('SECTION 1: Authentication, Authorization & Route Guards');

await asyncTest('Unauthenticated request to root / redirects 307 to /login', async () => {
  const res = await fetch(`${BASE_URL_NEXT}/`, { redirect: 'manual' });
  assert.strictEqual(res.status, 307);
  assert.ok(res.headers.get('location')?.includes('/login?redirectTo='));
});

await asyncTest('Unauthenticated access to /users redirects to /login', async () => {
  const res = await fetch(`${BASE_URL_NEXT}/users`, { redirect: 'manual' });
  assert.strictEqual(res.status, 307);
  assert.ok(res.headers.get('location')?.includes('/login?redirectTo=%2Fusers'));
});

await asyncTest('Non-admin employee attempting /users redirects 307 to root with unauthorized error', async () => {
  const res = await fetch(`${BASE_URL_NEXT}/users`, {
    redirect: 'manual',
    headers: {
      Cookie: 'candela_session=emp-token-01; candela_role=employee; candela_status=active',
    },
  });
  assert.strictEqual(res.status, 307);
  assert.ok(res.headers.get('location')?.includes('error=unauthorized_admin_required'));
});

await asyncTest('Active administrator can access /users with 200 OK', async () => {
  const res = await fetch(`${BASE_URL_NEXT}/users`, {
    redirect: 'manual',
    headers: {
      Cookie: 'candela_session=admin-token-01; candela_role=admin; candela_status=active',
    },
  });
  assert.strictEqual(res.status, 200);
});

await asyncTest('Inactive deactivated user is forcibly signed out and redirected to login with error', async () => {
  const res = await fetch(`${BASE_URL_NEXT}/`, {
    redirect: 'manual',
    headers: {
      Cookie: 'candela_session=deactivated-token; candela_role=employee; candela_status=inactive',
    },
  });
  assert.strictEqual(res.status, 307);
  assert.ok(res.headers.get('location')?.includes('error=deactivated'));
});

await asyncTest('Direct API administrative user creation is forbidden to non-admin roles', async () => {
  const res = await fetch(`${BASE_URL_NEXT}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'candela_session=emp-token; candela_role=employee; candela_status=active',
    },
    body: JSON.stringify({
      full_name: 'Attacker Impersonator',
      email: 'attacker@evil.com',
      role: 'admin',
    }),
  });
  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.ok(data.error?.includes('Forbidden'));
});

// -----------------------------------------------------------------------------
// SECTION 2: INVENTORY DATABASE, VALIDATIONS & DATA ARCHITECTURE
// -----------------------------------------------------------------------------
console.log('\nSECTION 2: Four Inventory Categories & Seed Data Consistency');

test('Seed file defines all 4 categories with confirmed statuses', () => {
  const seedPath = path.join(ROOT_DIR, 'src', 'data', 'inventorySeed.ts');
  const content = fs.readFileSync(seedPath, 'utf8');

  assert.ok(content.includes('INITIAL_LANFORGES'));
  assert.ok(content.includes('INITIAL_DESKTOPS'));
  assert.ok(content.includes('INITIAL_MOBILES'));
  assert.ok(content.includes('INITIAL_CHAMBERS'));

  // Confirmed locations
  assert.ok(content.includes('VINSR'));
  assert.ok(content.includes('OPEL'));
  assert.ok(content.includes('GVP'));

  // Global statuses
  assert.ok(content.includes('Available'));
  assert.ok(content.includes('In-Use'));
  assert.ok(content.includes('Under Maintenance'));
});

test('LANforge radio configurations support multiple chipset entries per unit', () => {
  const seedPath = path.join(ROOT_DIR, 'src', 'data', 'inventorySeed.ts');
  const content = fs.readFileSync(seedPath, 'utf8');
  assert.ok(content.includes('Qualcomm QCN9274'));
  assert.ok(content.includes('Broadcom BCM4375'));
  assert.ok(content.includes('Intel AX210'));
  assert.ok(content.includes('lanforgeRef'));
});

test('Inventory modals consume dynamic dropdown values from DropdownContext', () => {
  const lfModalPath = path.join(ROOT_DIR, 'src', 'components', 'inventory', 'lanforge', 'AddEditLANforgeModal.tsx');
  const dtModalPath = path.join(ROOT_DIR, 'src', 'components', 'inventory', 'desktop', 'AddEditDesktopModal.tsx');
  const mbModalPath = path.join(ROOT_DIR, 'src', 'components', 'inventory', 'mobile', 'AddEditMobileModal.tsx');
  const chModalPath = path.join(ROOT_DIR, 'src', 'components', 'inventory', 'chamber', 'AddEditChamberModal.tsx');

  assert.ok(fs.readFileSync(lfModalPath, 'utf8').includes('useDropdowns'));
  assert.ok(fs.readFileSync(dtModalPath, 'utf8').includes('useDropdowns'));
  assert.ok(fs.readFileSync(mbModalPath, 'utf8').includes('useDropdowns'));
  assert.ok(fs.readFileSync(chModalPath, 'utf8').includes('useDropdowns'));
});

// -----------------------------------------------------------------------------
// SECTION 3: ASSIGNMENT LIFECYCLE, INTEGRITY GUARDS & ATOMICITY
// -----------------------------------------------------------------------------
console.log('\nSECTION 3: Equipment Assignment, Custody Transfers & Audit History');

test('PostgreSQL schema enforces partial unique index preventing duplicate active assignments', () => {
  const sqlPath = path.join(ROOT_DIR, 'supabase', 'full_production_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  assert.ok(sql.includes('create unique index if not exists idx_unique_active_assignment'));
  assert.ok(sql.includes("where assignment_status = 'active'"));
});

test('PostgreSQL schema provides atomic stored procedures for assign, return, and transfer', () => {
  const sqlPath = path.join(ROOT_DIR, 'supabase', 'full_production_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  assert.ok(sql.includes('create or replace function public.fn_assign_equipment'));
  assert.ok(sql.includes('create or replace function public.fn_return_equipment'));
  assert.ok(sql.includes('create or replace function public.fn_transfer_equipment'));
});

test('Under Maintenance guard prevents assignment of defective hardware', () => {
  const sqlPath = path.join(ROOT_DIR, 'supabase', 'full_production_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  assert.ok(sql.includes('Cannot assign equipment currently marked Under Maintenance'));
});

test('Inactive employee guard prevents allocation to deactivated accounts', () => {
  const sqlPath = path.join(ROOT_DIR, 'supabase', 'full_production_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  assert.ok(sql.includes('Cannot assign equipment to inactive or non-existent employee'));
});

// -----------------------------------------------------------------------------
// SECTION 4: AI CONVERSATIONAL ASSISTANT COMPREHENSIVE VERIFICATION
// -----------------------------------------------------------------------------
console.log('\nSECTION 4: Conversational AI Assistant & 14 Prompt Scenarios');

const testQueries = [
  {
    category: 'LANforge',
    prompt: 'CT521B has two Intel AX210 radios.',
    expectedIntent: 'Update LANforge Radios',
    requiresPreview: true,
  },
  {
    category: 'LANforge',
    prompt: 'Change CT521A location to OPEL.',
    expectedIntent: 'Relocate Equipment',
    requiresPreview: true,
  },
  {
    category: 'LANforge',
    prompt: 'How many 11be clients does CT523C have?',
    expectedText: 'LF-523C-002',
    requiresPreview: false,
  },
  {
    category: 'LANforge',
    prompt: 'Show available LANforges at VINSR.',
    expectedText: 'No hardware records matched',
    requiresPreview: false,
  },
  {
    category: 'LANforge',
    prompt: 'Who previously used CT521B?',
    expectedText: 'Custody history for LF-521B-001',
    requiresPreview: false,
  },
  {
    category: 'Desktop',
    prompt: 'Assign DESK001 to Fayaz.',
    expectedText: 'already has an active assignment',
    requiresPreview: false,
  },
  {
    category: 'Desktop',
    prompt: 'Mark DESK002 as under maintenance.',
    expectedIntent: 'Shift Status',
    requiresPreview: true,
  },
  {
    category: 'Desktop',
    prompt: 'Show all available desktops.',
    expectedText: 'matching inventory record',
    requiresPreview: false,
  },
  {
    category: 'Mobile',
    prompt: 'Update the model of MOB001.',
    expectedIntent: 'Update Specification Model',
    requiresPreview: true,
  },
  {
    category: 'Mobile',
    prompt: 'Who is currently using MOB002?',
    expectedText: 'MOB-SAMS-02',
    requiresPreview: false,
  },
  {
    category: 'Mobile',
    prompt: 'Show all mobiles assigned to me.',
    expectedText: 'no active hardware assignments',
    requiresPreview: false,
  },
  {
    category: 'Chamber',
    prompt: 'Assign Chamber 03 to Fayaz.',
    expectedIntent: 'Assign Equipment',
    requiresPreview: true,
  },
  {
    category: 'Chamber',
    prompt: 'Return Chamber 03.',
    expectedText: 'does not currently have an active assignment to return',
    requiresPreview: false,
  },
  {
    category: 'Chamber',
    prompt: 'Which chambers are currently available?',
    expectedText: 'matching inventory record',
    requiresPreview: false,
  },
];

for (const t of testQueries) {
  await asyncTest(`AI Assistant handles [${t.category}]: "${t.prompt}"`, async () => {
    const res = await fetch(`${BASE_URL_AI}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin',
        'x-user-id': 'usr-admin-01',
        'x-user-name': 'Alex Mercer',
      },
      body: JSON.stringify({ message: t.prompt }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();

    if (t.requiresPreview) {
      assert.ok(data.action_preview, 'Must return action preview');
      assert.ok(data.action_preview.title.includes(t.expectedIntent));
      assert.ok(data.action_preview.confirmation_token, 'Must include cryptographic token');
    } else {
      assert.ok(data.text?.includes(t.expectedText), `Expected text containing "${t.expectedText}"`);
    }
  });
}

await asyncTest('AI Assistant rejects mutation requests from regular employees', async () => {
  const res = await fetch(`${BASE_URL_AI}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'employee',
      'x-user-id': 'usr-emp-03',
      'x-user-name': 'Elena Rostova',
    },
    body: JSON.stringify({ message: 'Assign DT-LEN-03 to Fayaz' }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.text?.includes('Permission Denied'));
  assert.ok(!data.action_preview);
});

await asyncTest('AI confirmation token is strictly single-use (replay prevention)', async () => {
  const chatRes = await fetch(`${BASE_URL_AI}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
    body: JSON.stringify({ message: 'Change CT521A location to OPEL.' }),
  });
  const chatData = await chatRes.json();
  const token = chatData.action_preview?.confirmation_token;
  assert.ok(token);

  // 1st consumption: 200 OK
  const conf1 = await fetch(`${BASE_URL_AI}/actions/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
    body: JSON.stringify({ confirmation_token: token, user_confirmed: true }),
  });
  assert.strictEqual(conf1.status, 200);

  // 2nd consumption: 400 Bad Request
  const conf2 = await fetch(`${BASE_URL_AI}/actions/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
    body: JSON.stringify({ confirmation_token: token, user_confirmed: true }),
  });
  assert.strictEqual(conf2.status, 400);
});

// -----------------------------------------------------------------------------
// SECTION 5: SECURITY AUDIT & DEFENSE IN DEPTH
// -----------------------------------------------------------------------------
console.log('\nSECTION 5: Application Security & Hardening');

test('Privileged SUPABASE_SERVICE_ROLE_KEY is never imported in client components', () => {
  const srcFiles = [];
  function scan(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        scan(full);
      } else if (f.endsWith('.tsx') || (f.endsWith('.ts') && !f.includes('admin.ts'))) {
        srcFiles.push(full);
      }
    }
  }
  scan(path.join(ROOT_DIR, 'src'));

  for (const file of srcFiles) {
    const text = fs.readFileSync(file, 'utf8');
    assert.ok(
      !text.includes('SUPABASE_SERVICE_ROLE_KEY'),
      `Security violation: SUPABASE_SERVICE_ROLE_KEY referenced in ${file}`
    );
  }
});

test('Vercel production security headers configured (CSP, HSTS, X-Frame-Options, X-Content-Type)', () => {
  const vercelPath = path.join(ROOT_DIR, 'vercel.json');
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

  const headers = vercel.headers[0].headers;
  const headerKeys = headers.map((h) => h.key.toLowerCase());

  assert.ok(headerKeys.includes('content-security-policy'));
  assert.ok(headerKeys.includes('x-frame-options'));
  assert.ok(headerKeys.includes('x-content-type-options'));
  assert.ok(headerKeys.includes('strict-transport-security'));
  assert.ok(headerKeys.includes('referrer-policy'));
});

test('FastAPI backend restricts wildcards in production environment', () => {
  const configPath = path.join(ROOT_DIR, 'backend', 'app', 'config.py');
  const configText = fs.readFileSync(configPath, 'utf8');
  assert.ok(configText.includes('ENVIRONMENT') && configText.includes('"production"'));
  assert.ok(configText.includes('candela-inventory.vercel.app'));
});

test('.env.local is safely ignored by Git to prevent credential leaks', () => {
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  assert.ok(gitignore.includes('.env*'));
});

// -----------------------------------------------------------------------------
// SECTION 6: UI, VISUAL IDENTITY & ACCESSIBILITY AUDIT
// -----------------------------------------------------------------------------
console.log('\nSECTION 6: Strict Visual Identity & Absence of Prohibited Elements');

test('Strict visual design rules: ZERO gradients in codebase', () => {
  const filesToCheck = [];
  function scan(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        scan(full);
      } else if (f.endsWith('.tsx')) {
        filesToCheck.push(full);
      }
    }
  }
  scan(path.join(ROOT_DIR, 'src', 'components'));

  for (const file of filesToCheck) {
    const text = fs.readFileSync(file, 'utf8');
    assert.ok(
      !text.includes('bg-gradient') && !text.includes('linear-gradient'),
      `Design rule violation: Gradient found in ${file}`
    );
  }
});

test('Strict visual design rules: ZERO chart libraries in dependencies', () => {
  const pkgPath = path.join(ROOT_DIR, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  assert.strictEqual(deps['recharts'], undefined);
  assert.strictEqual(deps['chart.js'], undefined);
  assert.strictEqual(deps['apexcharts'], undefined);
});

test('Color tokens adhere strictly to Forest-Green palette', () => {
  const cssPath = path.join(ROOT_DIR, 'src', 'app', 'globals.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  // #173D30 (Forest green sidebar)
  // #247A51 (Primary green)
  // #F5F7F5 (Background workspace)
  assert.ok(css.includes('#173D30') || css.includes('173D30'));
  assert.ok(css.includes('#247A51') || css.includes('247A51'));
  assert.ok(css.includes('#F5F7F5') || css.includes('F5F7F5'));
});

console.log('\n====================================================');
console.log(`PHASE 7 QA & SECURITY SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
if (failures.length > 0) {
  console.log(`FAILURES (${failures.length}):`);
  failures.forEach((f) => console.log(` - ${f.name}: ${f.error}`));
}
console.log('====================================================\n');

if (failures.length > 0) {
  process.exit(1);
}
