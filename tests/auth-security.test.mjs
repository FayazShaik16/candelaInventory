// test-auth-security.mjs
// Automated verification suite for Candela Inventory Phase 2 Security & Auth

import { hasPermission, canUserPerform, assertAdmin } from './src/lib/auth/permissions.js';

console.log('====================================================');
console.log('CANDELA INVENTORY PLATFORM — PHASE 2 VERIFICATION');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Role & Permission Tests
console.log('--- 1. Role & Permission Matrix Tests ---');
assert(hasPermission('admin', 'canManageUsers') === true, 'Admin has canManageUsers');
assert(hasPermission('admin', 'canCreateAccounts') === true, 'Admin has canCreateAccounts');
assert(hasPermission('admin', 'canAddInventory') === true, 'Admin has canAddInventory');
assert(hasPermission('admin', 'canEditEmployeeRole') === true, 'Admin has canEditEmployeeRole');

assert(hasPermission('employee', 'canManageUsers') === false, 'Employee CANNOT manage users');
assert(hasPermission('employee', 'canCreateAccounts') === false, 'Employee CANNOT create accounts');
assert(hasPermission('employee', 'canAddInventory') === false, 'Employee CANNOT add inventory');
assert(hasPermission('employee', 'canEditEmployeeRole') === false, 'Employee CANNOT edit roles');
assert(hasPermission('employee', 'canViewAllInventory') === true, 'Employee CAN view inventory');

// 2. Inactive account tests
console.log('\n--- 2. Account Status & Inactivation Tests ---');
const inactiveAdmin = {
  id: 'test-1',
  full_name: 'Test Inactive',
  email: 'test@candelatech.com',
  role: 'admin',
  account_status: 'inactive',
};
assert(canUserPerform(inactiveAdmin, 'canManageUsers') === false, 'Inactive admin CANNOT perform actions');

let thrown = false;
try {
  assertAdmin(inactiveAdmin);
} catch (e) {
  thrown = true;
}
assert(thrown === true, 'assertAdmin throws for inactive admin');

const activeEmployee = {
  id: 'test-2',
  full_name: 'Fayaz',
  email: 'fayaz@candelatech.com',
  role: 'employee',
  account_status: 'active',
};
thrown = false;
try {
  assertAdmin(activeEmployee);
} catch (e) {
  thrown = true;
}
assert(thrown === true, 'assertAdmin throws for active employee attempting admin operation');

// 3. Client bundle security check
console.log('\n--- 3. Secret Leakage & Exposure Tests ---');
import fs from 'fs';
import path from 'path';

function checkDirForSecret(dir) {
  let found = false;
  if (!fs.existsSync(dir)) return false;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (checkDirForSecret(full)) found = true;
    } else if (f.endsWith('.js') || f.endsWith('.json')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('SUPABASE_SERVICE_ROLE_KEY') && !full.includes('api') && !full.includes('admin.ts')) {
        console.error(`Suspicious reference in ${full}`);
        found = true;
      }
    }
  }
  return found;
}

const leakFound = checkDirForSecret('.next/static');
assert(!leakFound, 'No SUPABASE_SERVICE_ROLE_KEY exposed in client-side static chunks');

console.log('\n====================================================');
console.log(`Summary: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
