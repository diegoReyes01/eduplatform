import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'SUPER_ADMIN' }, update: {}, create: { name: 'SUPER_ADMIN', description: 'Super Administrador' } }),
    prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN', description: 'Administrador' } }),
    prisma.role.upsert({ where: { name: 'TEACHER' }, update: {}, create: { name: 'TEACHER', description: 'Profesor' } }),
    prisma.role.upsert({ where: { name: 'STUDENT' }, update: {}, create: { name: 'STUDENT', description: 'Estudiante' } }),
    prisma.role.upsert({ where: { name: 'PARENT' }, update: {}, create: { name: 'PARENT', description: 'Padre/Tutor' } }),
  ]);
  console.log(`✔ Roles creados: ${roles.length}`);

  const levels = [
    { number: 1, name: 'Principiante', xpRequired: 0, xpMax: 100 },
    { number: 2, name: 'Aprendiz', xpRequired: 100, xpMax: 250 },
    { number: 3, name: 'Estudiante', xpRequired: 250, xpMax: 500 },
    { number: 4, name: 'Aventurero', xpRequired: 500, xpMax: 1000 },
    { number: 5, name: 'Explorador', xpRequired: 1000, xpMax: 2000 },
    { number: 6, name: 'Conocedor', xpRequired: 2000, xpMax: 3500 },
    { number: 7, name: 'Experto', xpRequired: 3500, xpMax: 5500 },
    { number: 8, name: 'Maestro', xpRequired: 5500, xpMax: 8000 },
    { number: 9, name: 'Sabio', xpRequired: 8000, xpMax: 12000 },
    { number: 10, name: 'Leyenda', xpRequired: 12000, xpMax: 99999 },
  ];
  for (const level of levels) {
    await prisma.level.upsert({ where: { number: level.number }, update: {}, create: level });
  }
  console.log(`✔ Niveles creados: ${levels.length}`);

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
      experience: {
        create: {
          totalXp: 0,
          currentXp: 0,
          level: { connectOrCreate: { where: { number: 1 }, create: { number: 1, name: 'Principiante', xpRequired: 0, xpMax: 100 } } },
        },
      },
    },
  });
  console.log(`✔ Usuario admin creado: ${admin.email}`);

  const misionCount = await prisma.mission.count();
  if (misionCount === 0) {
    await prisma.mission.createMany({
      data: [
        { title: "Inicio del día", description: "Inicia sesión en la plataforma", type: "DAILY", xpReward: 10, criteria: { action: "LOGIN_DIARIO", count: 1, emoji: "🌅" }, isActive: true },
        { title: "Explorador 3D", description: "Explora un modelo en el Laboratorio 3D", type: "DAILY", xpReward: 15, criteria: { action: "VER_MODELO_3D", count: 1, emoji: "🔬" }, isActive: true },
        { title: "Lector activo", description: "Abre un recurso de una materia", type: "DAILY", xpReward: 20, criteria: { action: "LEER_PRESENTACION", count: 1, emoji: "📖" }, isActive: true },
        { title: "Científico de la semana", description: "Explora 5 modelos 3D esta semana", type: "WEEKLY", xpReward: 100, criteria: { action: "VER_MODELO_3D", count: 5, emoji: "⚗️" }, isActive: true },
        { title: "Tareas al día", description: "Entrega 3 tareas esta semana", type: "WEEKLY", xpReward: 150, criteria: { action: "COMPLETAR_TAREA", count: 3, emoji: "📝" }, isActive: true },
        { title: "Lector voraz", description: "Lee 5 recursos esta semana", type: "WEEKLY", xpReward: 120, criteria: { action: "LEER_PRESENTACION", count: 5, emoji: "📚" }, isActive: true },
        { title: "Primer paso", description: "Completa tu primer inicio de sesión diario", type: "SPECIAL", xpReward: 50, criteria: { action: "LOGIN_DIARIO", count: 1, emoji: "🎯" }, isActive: true },
        { title: "Maestro del Laboratorio", description: "Explora los 6 modelos del Laboratorio 3D", type: "SPECIAL", xpReward: 300, criteria: { action: "VER_MODELO_3D", count: 6, emoji: "🏆" }, isActive: true },
        { title: "Entregador imparable", description: "Entrega 10 tareas en total", type: "SPECIAL", xpReward: 500, criteria: { action: "COMPLETAR_TAREA", count: 10, emoji: "🚀" }, isActive: true },
      ],
    });
    console.log('✔ Misiones creadas: 9');
  } else {
    console.log(`✔ Misiones ya existentes: ${misionCount}`);
  }

  console.log('✅ Seed completado');
  console.log('   Email:    admin@eduplatform.com');
  console.log('   Password: Admin123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());