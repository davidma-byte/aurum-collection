/**
 * Role-access check against a RUNNING server (npm run dev or npm start).
 * Proves that a logged-out visitor and a CLIENT get 404 on the admin area while an ADMIN gets through.
 *
 *   npm run dev      (terminal 1)
 *   npm run test:access   (terminal 2)
 *
 * Note: /admin/login is 200 for a logged-out visitor (otherwise no staff member could ever sign in)
 * and 404 for a signed-in CLIENT.
 */
import './env';
import { prisma } from '../src/lib/prisma';

const BASE = process.env.BASE_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
const ADMIN = { email: process.env.SEED_ADMIN_EMAIL ?? 'admin@aurum.example', password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin#2026Aurum' };
const CLIENT = { email: process.env.SEED_CLIENT_EMAIL ?? 'client@aurum.example', password: process.env.SEED_CLIENT_PASSWORD ?? 'Client#2026Aurum' };

class Jar {
  private cookies = new Map<string, string>();
  absorb(res: Response) {
    for (const line of res.headers.getSetCookie()) {
      const [pair] = line.split(';');
      const i = pair.indexOf('=');
      const name = pair.slice(0, i).trim();
      const value = pair.slice(i + 1);
      if (/expires=thu, 01 jan 1970/i.test(line) || value === '') this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }
  header() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

async function req(jar: Jar, path: string, init: RequestInit = {}) {
  const res = await fetch(BASE + path, {
    redirect: 'manual',
    ...init,
    headers: { ...(init.headers as Record<string, string>), cookie: jar.header() },
  });
  jar.absorb(res);
  return res;
}

async function signIn(email: string, password: string, portal: 'client' | 'admin' = 'client') {
  const jar = new Jar();
  const csrf = await (await req(jar, '/api/auth/csrf')).json();
  const body = new URLSearchParams({ csrfToken: csrf.csrfToken, email, password, portal, json: 'true' });
  const res = await req(jar, '/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  await res.text();
  const session = await (await req(jar, '/api/auth/session')).json();
  if (!session?.user) throw new Error(`Sign-in failed for ${email}`);
  return { jar, role: session.user.role as string };
}

const results: { name: string; pass: boolean; detail: string }[] = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
}

async function status(jar: Jar, path: string, init?: RequestInit) {
  const res = await req(jar, path, init);
  const text = await res.text();
  return { status: res.status, location: res.headers.get('location') ?? '', text };
}

async function main() {
  const anon = new Jar();
  const adminPaths = ['/admin', '/admin/fleet', '/admin/fleet/new', '/admin/bookings', '/admin/inquiries', '/admin/audit'];

  // Logged out
  for (const p of adminPaths) {
    const r = await status(anon, p);
    check(`logged out  GET ${p}`, r.status === 404, `status ${r.status}`);
  }
  {
    const r = await status(anon, '/admin/login');
    check('logged out  GET /admin/login (staff entry, must render)', r.status === 200, `status ${r.status}`);
    const api = await status(anon, '/api/admin/stats');
    check('logged out  GET /api/admin/stats', api.status === 404 && api.text.includes('Not found'), `status ${api.status}`);
    const post = await status(anon, '/api/admin/stats', { method: 'POST' });
    check('logged out  POST /api/admin/stats', post.status === 404, `status ${post.status}`);
    const home = await status(anon, '/');
    check('logged out  home page has no Admin link', !/href="\/admin/.test(home.text), 'checked HTML');
  }

  // Client
  const client = await signIn(CLIENT.email, CLIENT.password);
  check('client signed in with role CLIENT', client.role === 'CLIENT', `role ${client.role}`);
  for (const p of [...adminPaths, '/admin/login']) {
    const r = await status(client.jar, p);
    check(`CLIENT      GET ${p}`, r.status === 404, `status ${r.status}`);
  }
  {
    const api = await status(client.jar, '/api/admin/stats');
    check('CLIENT      GET /api/admin/stats', api.status === 404 && api.text.includes('Not found'), `status ${api.status}`);
    const login = await status(client.jar, '/login');
    check('CLIENT      /login redirects to /account', [302, 307, 308].includes(login.status) && login.location.endsWith('/account'), `${login.status} -> ${login.location}`);
    const home = await status(client.jar, '/');
    check('CLIENT      home page has no Admin link', !/href="\/admin/.test(home.text), 'checked HTML');
    const acct = await status(client.jar, '/account');
    check('CLIENT      /account renders', acct.status === 200, `status ${acct.status}`);
  }

  // A role sent to /api/register is ignored
  {
    const email = `access-check-${Date.now()}@example.test`;
    const res = await status(anon, '/api/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Role Probe', email, password: 'Probe1234x', confirmPassword: 'Probe1234x', role: 'ADMIN' }),
    });
    const row = await prisma.user.findUnique({ where: { email } });
    check('register with role=ADMIN creates a CLIENT', res.status === 201 && row?.role === 'CLIENT', `status ${res.status}, stored role ${row?.role}`);
    if (row) {
      const probe = await signIn(email, 'Probe1234x');
      const r = await status(probe.jar, '/admin');
      check('new self-registered account gets 404 on /admin', r.status === 404, `status ${r.status}`);
      await prisma.user.delete({ where: { id: row.id } });
    }
  }

  // Client cannot use the staff portal; error is generic
  {
    let failed = false;
    try { await signIn(CLIENT.email, CLIENT.password, 'admin'); } catch { failed = true; }
    check('CLIENT credentials rejected by the staff portal', failed, failed ? 'sign-in refused' : 'signed in (BAD)');
  }

  // Admin
  const admin = await signIn(ADMIN.email, ADMIN.password, 'admin');
  check('admin signed in with role ADMIN', admin.role === 'ADMIN', `role ${admin.role}`);
  for (const p of adminPaths) {
    const r = await status(admin.jar, p);
    check(`ADMIN       GET ${p}`, r.status === 200, `status ${r.status}`);
  }
  {
    const api = await status(admin.jar, '/api/admin/stats');
    let ok = false;
    try { const j = JSON.parse(api.text); ok = api.status === 200 && typeof j.fleet === 'number'; } catch { /* not JSON */ }
    check('ADMIN       GET /api/admin/stats', ok, `status ${api.status}`);
    const login = await status(admin.jar, '/login');
    check('ADMIN       /login redirects to /admin', [302, 307, 308].includes(login.status) && login.location.endsWith('/admin'), `${login.status} -> ${login.location}`);
    const home = await status(admin.jar, '/');
    check('ADMIN       home page shows the Admin link', /href="\/admin"/.test(home.text), 'checked HTML');
  }

  const width = Math.max(...results.map((r) => r.name.length));
  for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name.padEnd(width)}  ${r.detail}`);
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed.`);
  await prisma.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
