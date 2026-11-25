const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

function assert(cond, msg) {
  if (!cond) {
    throw new Error(msg);
  }
}

async function runTests() {
  console.log(`\n=== Running Chatbot & DB Consistency Test Plan against ${BASE_URL} ===\n`);

  // 1. Verify DB Endpoints
  const inv = await fetchJson('/api/inventory');
  assert(inv.ok, `GET /api/inventory failed: ${inv.status}`);
  const lf = (inv.data.lanforges || []).filter((i) => !i.isArchived);
  const dt = (inv.data.desktops || []).filter((i) => !i.isArchived);
  const mb = (inv.data.mobiles || []).filter((i) => !i.isArchived);
  const ch = (inv.data.chambers || []).filter((i) => !i.isArchived);
  const allItems = [
    ...lf.map((i) => ({ ...i, category: 'lanforge', tag: i.lanforgeId })),
    ...dt.map((i) => ({ ...i, category: 'desktop', tag: i.deviceId })),
    ...mb.map((i) => ({ ...i, category: 'mobile', tag: i.deviceId })),
    ...ch.map((i) => ({ ...i, category: 'chamber', tag: i.chamberId })),
  ];
  console.log(`[PASS] GET /api/inventory: LF=${lf.length}, DT=${dt.length}, MB=${mb.length}, CH=${ch.length}, Total=${allItems.length}`);

  const users = await fetchJson('/api/users');
  assert(users.ok && Array.isArray(users.data.users), 'GET /api/users failed');
  console.log(`[PASS] GET /api/users: ${users.data.users.length} profiles`);

  const dropdowns = await fetchJson('/api/dropdowns');
  assert(dropdowns.ok && Array.isArray(dropdowns.data.items), 'GET /api/dropdowns failed');
  console.log(`[PASS] GET /api/dropdowns: ${dropdowns.data.items.length} options`);

  const reqs = await fetchJson('/api/requests');
  assert(reqs.ok && Array.isArray(reqs.data.requests), `GET /api/requests failed: ${reqs.status}`);
  console.log(`[PASS] GET /api/requests: ${reqs.data.requests.length} requests`);

  // Helper to call chatbot
  const askChat = async (message) => {
    const res = await fetchJson('/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin',
        'x-user-name': 'Admin Supervisor',
      },
      body: JSON.stringify({ message }),
    });
    assert(res.ok, `Chat API failed for "${message}": ${res.status}`);
    return res.data;
  };

  const tests = [
    {
      name: '1. Single Filter - Available Units (All returned, not 1)',
      query: 'Show all available units',
      check: (d) => {
        const expected = allItems.filter((i) => i.status === 'Available').length;
        assert(!d.action_preview, 'Should not trigger action_preview');
        assert(Array.isArray(d.query_results), 'Missing query_results');
        assert(d.query_results.length === expected, `Expected ${expected} available units, got ${d.query_results.length}`);
        assert(d.query_results.every((r) => r.status === 'Available'), 'Non-available unit returned');
      },
    },
    {
      name: '2. Single Filter - Under Maintenance (No action hijack)',
      query: 'Show all units under maintenance',
      check: (d) => {
        const expected = allItems.filter((i) => i.status === 'Under Maintenance').length;
        assert(!d.action_preview, 'Must NOT trigger status_update action_preview on a query!');
        assert(d.query_results.length === expected, `Expected ${expected} maintenance units, got ${d.query_results.length}`);
        assert(d.query_results.every((r) => r.status === 'Under Maintenance'), 'Non-maintenance unit returned');
      },
    },
    {
      name: '3. Single Filter - In-Use Units',
      query: 'Which units are in-use?',
      check: (d) => {
        const expected = allItems.filter((i) => i.status === 'In-Use').length;
        assert(!d.action_preview, 'Should not trigger action_preview');
        assert(d.query_results.length === expected, `Expected ${expected} in-use units, got ${d.query_results.length}`);
        assert(d.query_results.every((r) => r.status === 'In-Use'), 'Non-in-use unit returned');
      },
    },
    {
      name: '4. Single Filter - Category: LANforges',
      query: 'Show all LANforges',
      check: (d) => {
        assert(d.query_results.length === lf.length, `Expected ${lf.length} LANforges, got ${d.query_results.length}`);
        assert(d.query_results.every((r) => r.category === 'lanforge'), 'Non-lanforge item returned');
      },
    },
    {
      name: '5. Single Filter - Category: Real Devices (Mobiles + Desktops)',
      query: 'Show all real devices',
      check: (d) => {
        const expected = dt.length + mb.length;
        assert(d.query_results.length === expected, `Expected ${expected} real devices, got ${d.query_results.length}`);
        assert(d.query_results.every((r) => r.category === 'desktop' || r.category === 'mobile'), 'Invalid category for real devices');
      },
    },
    {
      name: '6. Single Filter - Category: Chambers',
      query: 'Show all chambers',
      check: (d) => {
        assert(d.query_results.length === ch.length, `Expected ${ch.length} chambers, got ${d.query_results.length}`);
        assert(d.query_results.every((r) => r.category === 'chamber'), 'Non-chamber item returned');
      },
    },
    {
      name: '7. Single Filter - Location: OPEL',
      query: 'Show all units in OPEL',
      check: (d) => {
        assert(d.query_results.length > 0, 'Expected OPEL units');
        assert(d.query_results.every((r) => r.location.toUpperCase().includes('OPEL')), 'Non-OPEL unit returned');
      },
    },
    {
      name: '8. Single Filter - Model Keyword: CT523c (Multiple units, not 1)',
      query: 'Show all CT523c units',
      check: (d) => {
        const expected = lf.filter((l) => `${l.lanforgeId} ${l.lanforgeModel}`.toLowerCase().includes('ct523c')).length;
        assert(d.query_results.length === expected, `Expected ${expected} CT523c units, got ${d.query_results.length}`);
      },
    },
    {
      name: '9. Multi-Filter - Available + LANforges + OPEL',
      query: 'Show available LANforges in OPEL',
      check: (d) => {
        const expected = lf.filter((l) => l.status === 'Available' && l.location.toUpperCase().includes('OPEL')).length;
        assert(d.query_results.length === expected, `Expected ${expected} available OPEL LANforges, got ${d.query_results.length}`);
        assert(d.query_results.every((r) => r.status === 'Available' && r.category === 'lanforge' && r.location.toUpperCase().includes('OPEL')), 'Filter mismatch');
      },
    },
    {
      name: '10. Multi-Filter - Available Chambers',
      query: 'Which chambers are available?',
      check: (d) => {
        const expected = ch.filter((c) => c.status === 'Available').length;
        assert(d.query_results.length === expected, `Expected ${expected} available chambers, got ${d.query_results.length}`);
        assert(d.query_results.every((r) => r.status === 'Available' && r.category === 'chamber'), 'Filter mismatch');
      },
    },
    {
      name: '11. Multi-Filter - Available Real Devices',
      query: 'Show available real devices',
      check: (d) => {
        const expected = [...dt, ...mb].filter((x) => x.status === 'Available').length;
        assert(d.query_results.length === expected, `Expected ${expected} available real devices, got ${d.query_results.length}`);
      },
    },
    {
      name: '12. Custodian Query (Must NOT trigger assign action_preview)',
      query: 'What equipment is assigned to Sirisha?',
      check: (d) => {
        assert(!d.action_preview, 'Must NOT trigger assignment action_preview when asking what is assigned!');
        assert(Array.isArray(d.query_results), 'Missing query_results');
      },
    },
    {
      name: '13. Specific Tag Lookup',
      query: `Check status of ${dt[0]?.deviceId || 'DT-01'}`,
      check: (d) => {
        assert(d.query_results.length === 1, `Expected 1 unit, got ${d.query_results.length}`);
        assert(d.query_results[0].tag === (dt[0]?.deviceId || 'DT-01'), 'Wrong unit returned');
      },
    },
    {
      name: '14. Action Preview - Assign Equipment',
      query: `Assign ${lf[0]?.lanforgeId || 'LF-OPEL-523C-01'} to Sirisha for project Netgear`,
      check: (d) => {
        assert(d.action_preview && d.action_preview.intent === 'equipment_assignment', 'Expected equipment_assignment preview');
      },
    },
    {
      name: '15. Action Preview - Release Equipment',
      query: `Release ${dt[0]?.deviceId || 'DT-01'}`,
      check: (d) => {
        assert(d.action_preview && d.action_preview.intent === 'equipment_return', 'Expected equipment_return preview');
      },
    },
    {
      name: '16. Action Preview - Set Under Maintenance',
      query: `Set ${dt[0]?.deviceId || 'DT-01'} to Under Maintenance`,
      check: (d) => {
        assert(d.action_preview && d.action_preview.intent === 'status_update', 'Expected status_update preview');
        assert(d.action_preview.target_status === 'Under Maintenance', 'Expected Under Maintenance target_status');
      },
    },
    {
      name: '17. Overview Summary Matches Live DB Counts',
      query: 'Hello',
      check: (d) => {
        assert(d.text.includes(`${lf.length} units`), `Overview LANforge count mismatch (expected ${lf.length})`);
        assert(d.text.includes(`${ch.length} enclosures`), `Overview Chamber count mismatch (expected ${ch.length})`);
      },
    },
  ];

  let passed = 0;
  let failed = 0;
  for (const t of tests) {
    try {
      const data = await askChat(t.query);
      t.check(data);
      console.log(`[PASS] ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${t.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Summary: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
