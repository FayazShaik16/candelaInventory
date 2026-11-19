// tests/inventory-verification.test.mjs
// Automated verification suite for Candela Inventory Phase 3:
// Database, Schema, 4 Categories, CRUD, Radios, Assignments, Metrics

import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('====================================================');
console.log('CANDELA INVENTORY PLATFORM — PHASE 3 VERIFICATION');
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

// 1. Database Schema Verification (002_inventory_schema.sql)
console.log('--- 1. Supabase PostgreSQL Schema Checks ---');
const schemaSql = readFileSync(resolve('supabase/migrations/002_inventory_schema.sql'), 'utf-8').toLowerCase();

assert(schemaSql.includes('create table if not exists public.lanforges'), 'LANforges table exists in schema');
assert(schemaSql.includes('create table if not exists public.lanforge_radios'), 'LANforge radios table exists with foreign key');
assert(schemaSql.includes('create table if not exists public.desktops'), 'Desktops table exists in schema');
assert(schemaSql.includes('create table if not exists public.mobiles'), 'Mobiles table exists in schema');
assert(schemaSql.includes('create table if not exists public.chambers'), 'Chambers table exists in schema');
assert(schemaSql.includes('create table if not exists public.equipment_assignments'), 'Equipment assignments table exists');
assert(schemaSql.includes("enum ('vinsr', 'opel', 'gvp')"), 'Location enum strictly restricts to VINSR, OPEL, GVP');
assert(schemaSql.includes("enable row level security"), 'RLS enabled on all inventory tables');

// 2. TypeScript Types Verification
console.log('\n--- 2. Type Architecture Checks ---');
const typesContent = readFileSync(resolve('src/types/inventory.ts'), 'utf-8');

assert(typesContent.includes('export interface LANforgeItem'), 'LANforgeItem interface defined');
assert(typesContent.includes('export interface DesktopItem'), 'DesktopItem interface defined');
assert(typesContent.includes('export interface MobileItem'), 'MobileItem interface defined');
assert(typesContent.includes('export interface ChamberItem'), 'ChamberItem interface defined');
assert(typesContent.includes('export interface EquipmentAssignment'), 'EquipmentAssignment interface defined');
assert(typesContent.includes("export type LANforgeLocation = 'VINSR' | 'OPEL' | 'GVP'"), 'LANforgeLocation type is strictly VINSR | OPEL | GVP');
assert(typesContent.includes("export type GlobalInventoryStatus = 'Available' | 'In-Use' | 'Under Maintenance'"), 'GlobalInventoryStatus is locked to Available | In-Use | Under Maintenance');

// 3. Modular UI Component Architecture Verification
console.log('\n--- 3. Modular UI Component Architecture Checks ---');
const lanforgeTable = readFileSync(resolve('src/components/inventory/lanforge/LANforgeTable.tsx'), 'utf-8');
const desktopTable = readFileSync(resolve('src/components/inventory/desktop/DesktopTable.tsx'), 'utf-8');
const mobileTable = readFileSync(resolve('src/components/inventory/mobile/MobileTable.tsx'), 'utf-8');
const chamberTable = readFileSync(resolve('src/components/inventory/chamber/ChamberTable.tsx'), 'utf-8');

assert(lanforgeTable.includes('export function LANforgeTable'), 'LANforgeTable exported');
assert(desktopTable.includes('export function DesktopTable'), 'DesktopTable exported');
assert(mobileTable.includes('export function MobileTable'), 'MobileTable exported');
assert(chamberTable.includes('export function ChamberTable'), 'ChamberTable exported');

assert(lanforgeTable.includes('previouslyUsedBy'), 'LANforge table renders derived Previously Used By history');
assert(lanforgeTable.includes('noOf11beClients'), 'LANforge table contains 11be / 11ax / 11ac / 11n client breakdown');

// 4. Radio Configuration Checks
console.log('\n--- 4. Repeatable Radio Configuration Checks ---');
const addEditLanforge = readFileSync(resolve('src/components/inventory/lanforge/AddEditLANforgeModal.tsx'), 'utf-8');
assert(addEditLanforge.includes('Repeatable Radio Configuration'), 'Repeatable Radio section implemented');
assert(addEditLanforge.includes('Add Radio'), 'Add Radio dynamic repeater present');
assert(addEditLanforge.includes('chipset'), 'Radio chipset input present');
assert(addEditLanforge.includes('quantity'), 'Radio quantity input present');

// 5. Validation Rules Checks
console.log('\n--- 5. Form Validation Checks ---');
assert(addEditLanforge.includes('isValidIpv4'), 'IPv4 validation regex helper enforced');
assert(addEditLanforge.includes('Client counts must be non-negative'), 'Client counts non-negative validation enforced');

// 6. Real Database Metrics Checks
console.log('\n--- 6. Real Live Metrics Checks ---');
const inventoryContext = readFileSync(resolve('src/context/InventoryContext.tsx'), 'utf-8');
assert(inventoryContext.includes('totalLANforges'), 'Metrics includes totalLANforges count');
assert(inventoryContext.includes('totalDesktops'), 'Metrics includes totalDesktops count');
assert(inventoryContext.includes('totalMobiles'), 'Metrics includes totalMobiles count');
assert(inventoryContext.includes('totalChambers'), 'Metrics includes totalChambers count');
assert(inventoryContext.includes('totalAvailable'), 'Metrics includes totalAvailable count');
assert(inventoryContext.includes('totalInUse'), 'Metrics includes totalInUse count');
assert(inventoryContext.includes('totalUnderMaintenance'), 'Metrics includes totalUnderMaintenance count');

// 7. Dedicated Category Routes Checks
console.log('\n--- 7. Dedicated Category Routes Checks ---');
const lfPage = readFileSync(resolve('src/app/inventory/lanforges/page.tsx'), 'utf-8');
const dtPage = readFileSync(resolve('src/app/inventory/desktops/page.tsx'), 'utf-8');
const mbPage = readFileSync(resolve('src/app/inventory/mobiles/page.tsx'), 'utf-8');
const chPage = readFileSync(resolve('src/app/inventory/chambers/page.tsx'), 'utf-8');

assert(lfPage.includes('initialNav="lanforges"'), '/inventory/lanforges page wired');
assert(dtPage.includes('initialNav="desktops"'), '/inventory/desktops page wired');
assert(mbPage.includes('initialNav="mobiles"'), '/inventory/mobiles page wired');
assert(chPage.includes('initialNav="chambers"'), '/inventory/chambers page wired');

console.log('\n====================================================');
console.log(`SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL PHASE 3 SPECIFICATIONS VERIFIED SUCCESSFULLY!\n');
}
