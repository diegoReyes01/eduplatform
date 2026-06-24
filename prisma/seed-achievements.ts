import { prisma } from '../src/lib/db/prisma';

async function main() {
  const achievements = [
    {
      name: "Primera Entrega",
      description: "Entrega tu primera tarea",
      icon: "📝",
      xpReward: 50,
      category: "ACADEMIC",
      isSecret: false,
      criteria: { action: "COMPLETAR_TAREA", count: 1 },
    },
    {
      name: "Estudiante Aplicado",
      description: "Entrega 5 tareas",
      icon: "📚",
      xpReward: 100,
      category: "ACADEMIC",
      isSecret: false,
      criteria: { action: "COMPLETAR_TAREA", count: 5 },
    },
    {
      name: "Explorador 3D",
      description: "Explora tu primer modelo 3D en el laboratorio",
      icon: "🔬",
      xpReward: 30,
      category: "PARTICIPATION",
      isSecret: false,
      criteria: { action: "VER_MODELO_3D", count: 1 },
    },
    {
      name: "Científico Curioso",
      description: "Explora 10 modelos 3D",
      icon: "⚗️",
      xpReward: 75,
      category: "PARTICIPATION",
      isSecret: false,
      criteria: { action: "VER_MODELO_3D", count: 10 },
    },
    {
      name: "Lector Constante",
      description: "Lee 5 presentaciones o recursos",
      icon: "📖",
      xpReward: 50,
      category: "ACADEMIC",
      isSecret: false,
      criteria: { action: "LEER_PRESENTACION", count: 5 },
    },
    {
      name: "Racha Semanal",
      description: "Inicia sesión 7 días seguidos",
      icon: "🔥",
      xpReward: 100,
      category: "STREAK",
      isSecret: false,
      criteria: { action: "LOGIN_DIARIO", count: 7 },
    },
    {
      name: "Centurión",
      description: "Acumula 100 XP en total",
      icon: "⭐",
      xpReward: 25,
      category: "MILESTONE",
      isSecret: false,
      criteria: { type: "totalXp", count: 100 },
    },
    {
      name: "Maestro del Conocimiento",
      description: "Acumula 500 XP en total",
      icon: "🏆",
      xpReward: 100,
      category: "MILESTONE",
      isSecret: false,
      criteria: { type: "totalXp", count: 500 },
    },
    {
      name: "Logro Secreto",
      description: "Completa una evaluación con puntaje perfecto",
      icon: "💎",
      xpReward: 200,
      category: "SPECIAL",
      isSecret: true,
      criteria: { action: "COMPLETAR_EVALUACION", count: 1 },
    },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
        where: { name: a.name },
        update: {},
        create: a,
    });
    console.log("Creado:", a.name);
  }

  console.log("Seed de logros completado.");
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});