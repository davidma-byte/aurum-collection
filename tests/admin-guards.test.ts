import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Static guarantee that nothing under the admin area can be added without a guard.
 * Server actions cannot be called over plain HTTP without their generated ids,
 * so we prove coverage by inspecting the source instead.
 */
const root = path.resolve(__dirname, '..', 'src');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

describe('admin guards', () => {
  it('every exported server action calls requireAdmin() first', () => {
    const file = path.join(root, 'app/admin/(panel)/actions.ts');
    const src = fs.readFileSync(file, 'utf8');
    expect(src.startsWith("'use server'")).toBe(true);
    const parts = src.split(/export async function /).slice(1);
    expect(parts.length).toBeGreaterThan(0);
    for (const part of parts) {
      const name = part.slice(0, part.indexOf('('));
      const body = part.slice(part.indexOf('{') + 1);
      const firstStatement = body.trim().split('\n')[0];
      expect(firstStatement, `${name} must start with requireAdmin()`).toMatch(/await requireAdmin\(\)/);
    }
  });

  it('the admin layout and every admin page call requireAdmin()', () => {
    const files = walk(path.join(root, 'app/admin/(panel)')).filter((f) => /(page|layout)\.tsx$/.test(f));
    expect(files.length).toBeGreaterThanOrEqual(7);
    for (const f of files) expect(fs.readFileSync(f, 'utf8'), f).toMatch(/requireAdmin\(\)/);
  });

  it('every admin route handler calls requireAdminApi()', () => {
    const files = walk(path.join(root, 'app/api/admin')).filter((f) => /route\.ts$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) expect(fs.readFileSync(f, 'utf8'), f).toMatch(/requireAdminApi\(\)/);
  });

  it('public code never imports from the admin area', () => {
    const publicFiles = walk(root).filter((f) => !f.includes(`${path.sep}admin${path.sep}`) && !f.includes('components/admin') && /\.(ts|tsx)$/.test(f));
    for (const f of publicFiles) {
      if (f.endsWith('requireAdmin.ts') || f.endsWith('middleware.ts')) continue;
      const src = fs.readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/from '@\/components\/admin\//);
      expect(src, f).not.toMatch(/from '@\/app\/admin\//);
    }
  });

  it('the Admin link in the navbar is conditional on the server session role', () => {
    const nav = fs.readFileSync(path.join(root, 'components/Navbar.tsx'), 'utf8');
    expect(nav).toMatch(/isAdmin &&/);
    expect(nav).not.toMatch(/hidden/);
  });
});
