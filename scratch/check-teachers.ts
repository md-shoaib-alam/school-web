import { PrismaClient } from '../../server/prisma/generated';

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, slug: true }
  });
  console.log('--- Tenants ---');
  console.log(JSON.stringify(tenants, null, 2));

  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          tenantId: true,
          tenant: { select: { slug: true } }
        }
      }
    }
  });

  console.log('\n--- Teachers ---');
  console.log(JSON.stringify(teachers, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
