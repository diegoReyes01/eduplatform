import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: { name: 'SUPER_ADMIN', description: 'Super Administrador' },
    }),
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN', description: 'Administrador' },
    }),
    prisma.role.upsert({
      where: { name: 'TEACHER' },
      update: {},
      create: { name: 'TEACHER', description: 'Profesor' },
    }),
    prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: { name: 'STUDENT', description: 'Estudiante' },
    }),
    prisma.role.upsert({
      where: { name: 'PARENT' },
      update: {},
      create: { name: 'PARENT', description: 'Padre/Tutor' },
    }),
  ]);

  console.log(`✔ Roles creados: ${roles.length}`);

  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const adminRole = roles.find(r => r.name === 'SUPER_ADMIN')!;

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduplatform.com' },
    update: {},
    create: {
      email: 'admin@eduplatform.com',
      username: 'admin',
      passwordHash: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: adminRole.id,
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log(`✔ Usuario admin creado: ${admin.email}`);
  console.log('\n✅ Seed completado');
  console.log('   Email:    admin@eduplatform.com');
  console.log('   Password: Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());