import './env';
import readline from 'readline';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { passwordRules, emailSchema } from '../src/lib/validation/auth';

const prisma = new PrismaClient();

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Mute echo while the password is typed.
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = () => {};
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
    if (hidden) process.stdout.write(question);
  });
}

async function main() {
  const name = (await ask('Name: ')).trim();
  const email = emailSchema.parse(await ask('Email: '));
  const password = passwordRules.parse(await ask('Password (hidden): ', true));
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash: hash, ...(name ? { name } : {}) },
    create: { name: name || 'Admin', email, passwordHash: hash, role: 'ADMIN' },
  });
  console.log(`Admin ready: ${user.email}`);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
