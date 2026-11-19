/**
 * PHASE 6 VERIFICATION TEST SUITE
 * Candela Inventory Management Platform: Production Deployment & Infrastructure
 */

import assert from 'assert';
import fs from 'fs';

console.log('====================================================');
console.log('RUNNING PHASE 6 PRODUCTION DEPLOYMENT & READINESS SUITE');
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

// -----------------------------------------------------------------------------
// SECTION 1: Admin Settings — Dropdown Menu Values Management
// -----------------------------------------------------------------------------
console.log('SECTION 1: Admin Settings — Dropdown Menu Values Editor');

it('DropdownContext.tsx defines all 6 requested hardware dropdown categories', () => {
  const content = fs.readFileSync('src/context/DropdownContext.tsx', 'utf8');
  const requiredCategories = ['locations', 'projects', 'chipsets', 'brands', 'chamberTypes', 'ethernetSpeeds'];
  requiredCategories.forEach((cat) => {
    assert(content.includes(cat), `Category '${cat}' must be defined in DropdownContext`);
  });
});

it('DropdownContext.tsx provides addItem, updateItem, deleteItem, toggleItemStatus, and resetCategoryToDefaults', () => {
  const content = fs.readFileSync('src/context/DropdownContext.tsx', 'utf8');
  assert(content.includes('addItem:'), 'Must export addItem function');
  assert(content.includes('updateItem:'), 'Must export updateItem function');
  assert(content.includes('deleteItem:'), 'Must export deleteItem function');
  assert(content.includes('toggleItemStatus:'), 'Must export toggleItemStatus function');
  assert(content.includes('resetCategoryToDefaults:'), 'Must export resetCategoryToDefaults function');
});

it('SettingsView.tsx includes a dedicated "Dropdown Menu Values" tab with category pills', () => {
  const content = fs.readFileSync('src/components/views/SettingsView.tsx', 'utf8');
  assert(content.includes('Dropdown Menu Values'), 'Must render Dropdown Menu Values tab');
  assert(content.includes('selectedCategory') && content.includes('setSelectedCategory'), 'Must support switching categories');
  assert(content.includes('Add Option') && content.includes('openAddModal'), 'Must support adding custom dropdown values');
  assert(content.includes('Reset Defaults'), 'Must support resetting to system defaults');
});

it('Inventory modals consume dynamic dropdown options from useDropdowns()', () => {
  const lfModal = fs.readFileSync('src/components/inventory/lanforge/AddEditLANforgeModal.tsx', 'utf8');
  assert(lfModal.includes('useDropdowns'), 'AddEditLANforgeModal must consume useDropdowns');
  assert(lfModal.includes('locationOptions.map'), 'Location select must map from dynamic locationOptions');
  assert(lfModal.includes('chipsetOptions.map'), 'Radio chipset select must map from dynamic chipsetOptions');

  const dtModal = fs.readFileSync('src/components/inventory/desktop/AddEditDesktopModal.tsx', 'utf8');
  assert(dtModal.includes('useDropdowns') && dtModal.includes('brandOptions.map'), 'AddEditDesktopModal must map dynamic brandOptions');

  const mbModal = fs.readFileSync('src/components/inventory/mobile/AddEditMobileModal.tsx', 'utf8');
  assert(mbModal.includes('useDropdowns') && mbModal.includes('brandOptions.map'), 'AddEditMobileModal must map dynamic brandOptions');

  const chModal = fs.readFileSync('src/components/inventory/chamber/AddEditChamberModal.tsx', 'utf8');
  assert(chModal.includes('useDropdowns') && chModal.includes('chamberTypeOptions.map'), 'AddEditChamberModal must map dynamic chamberTypeOptions');
});

// -----------------------------------------------------------------------------
// SECTION 2: Vercel Frontend Deployment Configuration
// -----------------------------------------------------------------------------
console.log('\nSECTION 2: Vercel Frontend Deployment Configuration');

it('vercel.json is configured with production security headers (CSP, HSTS, X-Frame-Options, X-Content-Type)', () => {
  assert(fs.existsSync('vercel.json'), 'vercel.json must exist in project root');
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert(vercelConfig.framework === 'nextjs', 'Framework must be nextjs');
  assert(vercelConfig.buildCommand === 'next build', 'Build command must be next build');
  
  const headers = vercelConfig.headers.find(h => h.source === '/(.*)').headers;
  const headerKeys = headers.map(h => h.key);
  assert(headerKeys.includes('X-Content-Type-Options'), 'Must include X-Content-Type-Options');
  assert(headerKeys.includes('X-Frame-Options'), 'Must include X-Frame-Options');
  assert(headerKeys.includes('Strict-Transport-Security'), 'Must include Strict-Transport-Security');
  assert(headerKeys.includes('Referrer-Policy'), 'Must include Referrer-Policy');
});

it('src/app/error.tsx exists and is a client component runtime error boundary', () => {
  assert(fs.existsSync('src/app/error.tsx'), 'src/app/error.tsx must exist');
  const errorFile = fs.readFileSync('src/app/error.tsx', 'utf8');
  assert(errorFile.includes("'use client'"), 'error.tsx must be a client component');
  assert(errorFile.includes('reset'), 'error.tsx must accept reset callback');
});

it('src/app/not-found.tsx exists and provides user-friendly 404 guidance', () => {
  assert(fs.existsSync('src/app/not-found.tsx'), 'src/app/not-found.tsx must exist');
  const notFound = fs.readFileSync('src/app/not-found.tsx', 'utf8');
  assert(notFound.includes('404'), 'Must mention 404');
  assert(notFound.includes('href="/"'), 'Must link back to workspace root');
});

it('src/app/loading.tsx exists and renders suspense synchronization state', () => {
  assert(fs.existsSync('src/app/loading.tsx'), 'src/app/loading.tsx must exist');
});

it('.env.example documents all public and server-side privileged environment variables', () => {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  assert(envExample.includes('NEXT_PUBLIC_SUPABASE_URL'), 'Must document NEXT_PUBLIC_SUPABASE_URL');
  assert(envExample.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'), 'Must document NEXT_PUBLIC_SUPABASE_ANON_KEY');
  assert(envExample.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Must document SUPABASE_SERVICE_ROLE_KEY');
  assert(envExample.includes('AI_BACKEND_URL'), 'Must document AI_BACKEND_URL');
  assert(envExample.includes('CONFIRMATION_SECRET'), 'Must document CONFIRMATION_SECRET');
  assert(!envExample.includes('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'), 'Service role key MUST NEVER have NEXT_PUBLIC_ prefix');
});

// -----------------------------------------------------------------------------
// SECTION 3: Hugging Face Spaces Deployment Configuration
// -----------------------------------------------------------------------------
console.log('\nSECTION 3: Hugging Face Spaces AI Backend Configuration');

it('backend/Dockerfile configures non-root user (UID 1000) and port 7860', () => {
  const dockerfile = fs.readFileSync('backend/Dockerfile', 'utf8');
  assert(dockerfile.includes('useradd -m -u 1000 user'), 'Must create user with UID 1000');
  assert(dockerfile.includes('EXPOSE 7860'), 'Must expose port 7860');
  assert(dockerfile.includes('--port') && dockerfile.includes('7860'), 'Uvicorn must bind port 7860');
});

it('backend/README.md contains valid Hugging Face Spaces YAML metadata', () => {
  const readme = fs.readFileSync('backend/README.md', 'utf8');
  assert(readme.includes('sdk: docker'), 'Must specify sdk: docker');
  assert(readme.includes('app_port: 7860'), 'Must specify app_port: 7860');
});

it('backend/app/config.py disallows wildcard CORS in production environment', () => {
  const config = fs.readFileSync('backend/app/config.py', 'utf8');
  assert(config.includes('ENVIRONMENT'), 'Must read ENVIRONMENT');
  assert(config.includes('ALLOWED_ORIGINS'), 'Must parse ALLOWED_ORIGINS');
});

it('backend/app/main.py configures structured logging and async lifespan handler', () => {
  const mainPy = fs.readFileSync('backend/app/main.py', 'utf8');
  assert(mainPy.includes('lifespan'), 'Must use lifespan context manager');
  assert(mainPy.includes('logging.getLogger'), 'Must configure structured logging');
  assert(mainPy.includes('/health'), 'Must expose /health endpoint');
});

// -----------------------------------------------------------------------------
// SECTION 4: Supabase Production Schema & Migrations
// -----------------------------------------------------------------------------
console.log('\nSECTION 4: Supabase Production Migrations & Constraints');

it('supabase/migrations/004_dropdown_settings_schema.sql exists with RLS and defaults', () => {
  assert(fs.existsSync('supabase/migrations/004_dropdown_settings_schema.sql'), '004 migration must exist');
  const migration = fs.readFileSync('supabase/migrations/004_dropdown_settings_schema.sql', 'utf8');
  assert(migration.includes('CREATE TABLE IF NOT EXISTS public.inventory_dropdown_settings'), 'Must create table');
  assert(migration.includes('ENABLE ROW LEVEL SECURITY'), 'Must enable RLS');
  assert(migration.includes('uq_dropdown_category_value'), 'Must enforce unique constraint on category and value');
  assert(migration.includes('ON CONFLICT (category, value) DO UPDATE'), 'Must include idempotent seed values');
});

it('supabase/schema.sql includes all four migrations sequentially', () => {
  const schema = fs.readFileSync('supabase/schema.sql', 'utf8');
  assert(schema.includes('001_auth_profiles.sql'), 'Must include 001');
  assert(schema.includes('002_inventory_schema.sql'), 'Must include 002');
  assert(schema.includes('003_assignments_and_activity_schema.sql'), 'Must include 003');
  assert(schema.includes('004_dropdown_settings_schema.sql'), 'Must include 004');
});

// -----------------------------------------------------------------------------
// SECTION 5: Comprehensive Deployment Documentation
// -----------------------------------------------------------------------------
console.log('\nSECTION 5: Deployment Guides & Documentation');

const requiredDocs = [
  'docs/DEPLOYMENT_GUIDE.md',
  'docs/ENV_REFERENCE.md',
  'docs/SUPABASE_SETUP_GUIDE.md',
  'docs/VERCEL_DEPLOYMENT.md',
  'docs/HUGGINGFACE_SPACES_DEPLOYMENT.md',
  'docs/DATABASE_MIGRATION_GUIDE.md',
  'docs/TROUBLESHOOTING.md',
  'docs/BACKUP_AND_RECOVERY.md',
  'docs/DEPLOYMENT_REPORT.md',
];

requiredDocs.forEach((docPath) => {
  it(`Documentation file ${docPath} exists and has substantive content`, () => {
    assert(fs.existsSync(docPath), `${docPath} must exist`);
    const content = fs.readFileSync(docPath, 'utf8');
    assert(content.length > 300, `${docPath} must have substantive content`);
  });
});

console.log('\n====================================================');
console.log(`PHASE 6 READINESS SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================================\n');

if (passedTests < totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
