import { config } from 'dotenv';
import path from 'path';

// Prisma CLI reads .env; the app reads .env.local. Scripts load .env.local first, then .env.
config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });
