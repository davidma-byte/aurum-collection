import '../scripts/env';
import { PrismaClient, type Collection } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN = { name: 'Aurum Admin', email: 'admin@aurum.example', password: 'Admin#2026Aurum' };
const CLIENT = { name: 'Tendai Moyo', email: 'client@aurum.example', password: 'Client#2026Aurum' };

interface Seed {
  id: string;
  name: string;
  collection: Collection;
  pricePerDay: number;
  imageUrl: string;
  description: string;
  specifications: string;
  history: string;
  condition: string;
}

// Illustrative sample data for coursework. Histories are descriptive, not documented provenance.
const fleet: Seed[] = [
  {
    id: 'classic-jaguar-etype', name: '1963 Jaguar E-Type Series 1 Coupé', collection: 'CLASSIC', pricePerDay: 1450,
    imageUrl: '/images/classic-1-main.jpg',
    description: 'The long-bonnet coupé many consider the most beautiful car of its era, finished in a deep colour with a tan interior. A natural choice for a wedding arrival or a photographed weekend.',
    specifications: '3.8 litre straight-six\nFour-speed manual\nApprox. 265 bhp\nTwo seats, wire wheels',
    history: 'Series 1 E-Types were introduced in 1961 and shaped the look of the sporting coupé for a decade. This car has been through a full restoration and has been kept in the collection since.',
    condition: 'Fully restored. Mechanically sorted, with fresh paint and an original-pattern interior. Hired with a briefed driver on request.',
  },
  {
    id: 'classic-mercedes-280sl', name: '1969 Mercedes-Benz 280SL "Pagoda"', collection: 'CLASSIC', pricePerDay: 1100,
    imageUrl: '/images/classic-2-main.jpg',
    description: 'An elegant roadster with the distinctive concave hardtop that gave the Pagoda its name. Comfortable, easy to drive and very photogenic.',
    specifications: '2.8 litre straight-six\nFour-speed manual (automatic available on request)\nTwo seats, removable hardtop and soft top',
    history: 'The W113 SL ran from 1963 to 1971 and became a staple of grand touring. This example has been maintained to a high standard and used sparingly.',
    condition: 'Excellent. Chrome and leather in very good order, with a recent service.',
  },
  {
    id: 'classic-chevrolet-belair', name: '1957 Chevrolet Bel Air', collection: 'CLASSIC', pricePerDay: 950,
    imageUrl: '/images/classic-3-main.jpg',
    description: 'Tail fins, two-tone paint and a wide bench seat. A roomy classic for a wedding party or a themed event.',
    specifications: 'V8 engine\nAutomatic transmission\nSix seats\nWhite-wall tyres',
    history: 'The 1957 Bel Air is among the most recognisable American cars of the 1950s. This one has been restored and finished in its period two-tone scheme.',
    condition: 'Very good. Bodywork and brightwork restored, interior original-pattern.',
  },
  {
    id: 'classic-ford-modelt', name: '1926 Ford Model T Coupe', collection: 'CLASSIC', pricePerDay: 850,
    imageUrl: '/images/classic-4-modelt.jpg',
    description: 'A genuine piece of motoring history that guests will gather around. Slow, charming and best suited to short, scenic hires and photography.',
    specifications: 'Four-cylinder petrol engine\nTwo-speed planetary transmission with pedals\nTwo seats\nTop speed suited to local roads only',
    history: 'The Model T put the world on wheels and was built for nearly two decades. Driving it differs from any modern car, so hires include a short briefing.',
    condition: 'Good, running and presentable. Operated with a briefed driver only.',
  },
  {
    id: 'classic-mustang-boss429', name: '1969 Ford Mustang Boss 429', collection: 'CLASSIC', pricePerDay: 2200,
    imageUrl: '/images/classic-5-boss429.jpg',
    description: 'One of the rarest and most sought-after Mustangs, built around a huge engine. A statement car for clients who want the real thing.',
    specifications: '429 cubic inch V8\nFour-speed manual\nTwo-door fastback, four seats',
    history: 'The Boss 429 was produced in small numbers so that Ford could homologate its engine for racing. It is rarely seen on the road.',
    condition: 'Excellent, driven rarely. A deposit and an experienced driver are required.',
  },
  {
    id: 'classic-mustang-fastback-65', name: 'Custom 1965 Ford Mustang Fastback', collection: 'CLASSIC', pricePerDay: 1300,
    imageUrl: '/images/classic-6-mustang-fastback.jpg',
    description: 'A custom-built fastback with period looks and modern reliability. Fast, loud and great fun for a day out.',
    specifications: 'Modified V8\nManual transmission\nUpgraded brakes and suspension\nFour seats',
    history: 'Built on the original 1965 fastback body and customised for performance and dependability.',
    condition: 'Very good. Recently serviced and track-ready.',
  },
  {
    id: 'modern-bmw-i7', name: 'BMW i7', collection: 'MODERN', pricePerDay: 650,
    imageUrl: '/images/modern-1-main.jpg',
    description: 'A silent, fully electric limousine with a rear cabin built for relaxing. Ideal for airport transfers, business travel and quiet arrivals.',
    specifications: 'Fully electric, dual motor\nAll-wheel drive\nFive seats\nRear entertainment screen, panoramic roof',
    history: 'BMW\u2019s electric flagship saloon, added to the collection for clients who want modern luxury without engine noise.',
    condition: 'Like new. Detailed before every hire.',
  },
  {
    id: 'modern-rolls-ghost', name: 'Rolls-Royce Ghost', collection: 'MODERN', pricePerDay: 1200,
    imageUrl: '/images/modern-2-main.jpg',
    description: 'The quiet, effortless Rolls-Royce for weddings and important arrivals. Built to be driven in, with a chauffeur if you prefer.',
    specifications: 'Twin-turbo V12\nAutomatic transmission\nFive seats\nStarlight headliner, rear-hinged coach doors',
    history: 'A contemporary Rolls-Royce known for its calm ride and craftsmanship, added to serve the collection\u2019s most formal occasions.',
    condition: 'Immaculate. Chauffeur available on request.',
  },
  {
    id: 'modern-bentley-gt', name: 'Bentley Continental GT', collection: 'MODERN', pricePerDay: 950,
    imageUrl: '/images/modern-3-main.jpg',
    description: 'A fast, comfortable grand tourer with a hand-finished cabin. Made for long drives and confident arrivals.',
    specifications: 'Twin-turbo engine\nAll-wheel drive\nAutomatic transmission\nFour seats, rotating-display dashboard',
    history: 'A modern grand tourer chosen for clients who want performance and comfort in the same car.',
    condition: 'Immaculate, detailed before every hire.',
  },
  {
    id: 'yacht-motor-80ft', name: '80 ft Motor Yacht', collection: 'YACHT', pricePerDay: 6500,
    imageUrl: '/images/yacht-1-main.jpg',
    description: 'A comfortable motor yacht for day charters, family gatherings and celebrations on the water. Crew included.',
    specifications: '80 ft overall\nTwin diesel engines\nThree cabins, saloon, flybridge\nCaptain and two crew',
    history: 'Maintained to a charter standard with regular surveys and refits.',
    condition: 'Very good. Survey and safety equipment up to date.',
  },
  {
    id: 'yacht-anima-maris', name: 'Anima Maris, 3-mast sailing yacht', collection: 'YACHT', pricePerDay: 9800,
    imageUrl: '/images/yacht-2-main.jpg',
    description: 'A three-masted sailing yacht for those who want the full experience of travelling under sail. Suited to weddings, small events and longer voyages.',
    specifications: 'Three masts, traditional rig\nAuxiliary engine\nMultiple cabins and a large deck\nFull professional crew',
    history: 'A classic sailing yacht that carries guests the old way: slowly, quietly and beautifully.',
    condition: 'Well kept. Rigging and sails inspected before every season.',
  },
  {
    id: 'yacht-black-superyacht', name: 'Black superyacht', collection: 'YACHT', pricePerDay: 14500,
    imageUrl: '/images/yacht-3-main.jpg',
    description: 'A dark, modern superyacht for large private parties and discreet travel. Fully crewed, with a full-time chef on request.',
    specifications: 'Modern superyacht\nMultiple decks and cabins\nTenders and water toys\nFull crew',
    history: 'The largest vessel in the collection, offered for premium private charters.',
    condition: 'Excellent. Bookings by arrangement with an advance deposit.',
  },
  {
    id: 'yacht-classic-schooner', name: 'Classic wooden schooner', collection: 'YACHT', pricePerDay: 5200,
    imageUrl: '/images/yacht-4-schooner.jpg',
    description: 'A traditional wooden schooner with varnished decks and timeless lines. Best for day sails, photography and relaxed gatherings.',
    specifications: 'Wooden hull\nTwo masts, gaff-style rig\nDay-sail capacity for a small party\nProfessional skipper',
    history: 'Built in the traditional manner and looked after by owners who value craftsmanship.',
    condition: 'Good. Regularly maintained, with annual re-varnishing.',
  },
];

async function main() {
  const adminHash = await bcrypt.hash(ADMIN.password, 12);
  const clientHash = await bcrypt.hash(CLIENT.password, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: { role: 'ADMIN', passwordHash: adminHash },
    create: { name: ADMIN.name, email: ADMIN.email, passwordHash: adminHash, role: 'ADMIN' },
  });
  const client = await prisma.user.upsert({
    where: { email: CLIENT.email },
    update: { passwordHash: clientHash },
    create: { name: CLIENT.name, email: CLIENT.email, passwordHash: clientHash, role: 'CLIENT' },
  });

  for (const { id, ...data } of fleet) {
    await prisma.fleetItem.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  // Sample bookings only on a fresh database, dated relative to today.
  if ((await prisma.booking.count()) === 0) {
    const day = (offset: number) => {
      const d = new Date();
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + offset));
    };
    const samples = [
      { fleetItemId: 'classic-jaguar-etype', startDate: day(10), endDate: day(12), status: 'CONFIRMED' as const, notes: 'Wedding arrival, Saturday morning.' },
      { fleetItemId: 'yacht-anima-maris', startDate: day(20), endDate: day(23), status: 'PENDING' as const, notes: 'Family celebration on the water.' },
      { fleetItemId: 'modern-bmw-i7', startDate: day(5), endDate: day(6), status: 'CANCELLED' as const, notes: null },
    ];
    for (const s of samples) {
      const b = await prisma.booking.create({ data: { userId: client.id, ...s } });
      await prisma.auditLog.create({ data: { userId: client.id, action: 'BOOKING_CREATED', entity: 'Booking', entityId: b.id } });
      if (s.status === 'CONFIRMED') await prisma.auditLog.create({ data: { userId: admin.id, action: 'BOOKING_CONFIRMED', entity: 'Booking', entityId: b.id } });
      if (s.status === 'CANCELLED') await prisma.auditLog.create({ data: { userId: client.id, action: 'BOOKING_CANCELLED', entity: 'Booking', entityId: b.id } });
    }
    await prisma.inquiry.createMany({
      data: [
        { name: 'Rudo Chikwanha', email: 'rudo@example.com', message: 'We are planning a wedding in March and would like the Pagoda for the arrival. Are weekends available?', status: 'NEW' },
        { name: 'Michael Ncube', email: 'michael@example.com', message: 'Do you offer a chauffeur with the Rolls-Royce Ghost for airport transfers?', status: 'HANDLED' },
      ],
    });
  }

  console.log(`Seeded ${fleet.length} fleet items, 2 users and sample bookings.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
