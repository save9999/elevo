import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const parent = await prisma.user.upsert({
    where: { email: 'test@elevo.local' },
    update: {},
    create: {
      email: 'test@elevo.local',
      passwordHash,
      name: 'Parent Test',
      role: 'PARENT',
    },
  });
  console.log('parent:', parent.id);

  const birthdate = new Date();
  birthdate.setFullYear(birthdate.getFullYear() - 7);

  const existing = await prisma.child.findFirst({
    where: { parentId: parent.id, firstName: 'Léa' },
  });

  const child =
    existing ??
    (await prisma.child.create({
      data: {
        parentId: parent.id,
        firstName: 'Léa',
        birthdate,
        parcours: 'EXPLORATEURS',
      },
    }));
  console.log('child:', child.id, child.firstName, child.parcours);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
