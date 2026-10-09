import { getServerSession, type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { encode } from 'next-auth/jwt';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validation/auth';
import { clientIp, loginLimiter } from '@/lib/rateLimit';

const CLIENT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const ADMIN_MAX_AGE = 60 * 60 * 8; // 8 hours
const isSecure = Boolean(
  process.env.NEXTAUTH_URL?.startsWith('https://') ||
  process.env.VERCEL_URL ||
  (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL?.includes('localhost'))
);

// Compared against when the email is unknown, so timing does not reveal which emails exist.
let dummyHash: string | undefined;
function getDummyHash(): string {
  return (dummyHash ??= bcrypt.hashSync('not-a-real-password', 12));
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'aurum-collection-ultra-secure-jwt-secret-key-2026-production',
  session: { strategy: 'jwt', maxAge: CLIENT_MAX_AGE, updateAge: CLIENT_MAX_AGE },
  jwt: {
    // Admin tokens expire after 8 hours, client tokens after 7 days.
    async encode({ token, secret, maxAge }) {
      const age = token?.role === 'ADMIN' ? ADMIN_MAX_AGE : (maxAge ?? CLIENT_MAX_AGE);
      return encode({ token, secret, maxAge: age });
    },
  },
  cookies: {
    sessionToken: {
      name: isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isSecure },
    },
  },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        portal: { label: 'Portal', type: 'text' },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password, portal } = parsed.data;

        const key = `${email}|${clientIp(req.headers ?? {})}`;
        if (!loginLimiter.check(key).allowed) throw new Error('RATE_LIMITED');

        const user = await prisma.user.findUnique({ where: { email } });
        const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? getDummyHash());

        // One generic failure for: unknown email, wrong password, or a client using the staff portal.
        if (!user || !passwordOk || (portal === 'admin' && user.role !== 'ADMIN')) {
          loginLimiter.fail(key);
          return null;
        }
        loginLimiter.reset(key);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && token.role) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);
