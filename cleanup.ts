import { prisma } from './src/lib/db/prisma';
async function main() {
  const result = await prisma.resource.deleteMany({
    where: { id: { in: ['cmqq7fhlw0007sirdufdwqb9z','cmqq5ligb0019td0x6x83fey3','cmqhniq1k0005ftpuigcdsqv6'] } }
  });
  console.log('Eliminados:', result.count);
  await prisma.$disconnect();
}
main();
