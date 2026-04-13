import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

/**
 * Full Database Reset Script
 * Clears all data while respecting foreign key constraints.
 * Leaves only the root Super Admin account.
 */
async function main() {
  console.log('🚀 Starting full database cleanup...');

  // ── Clean up all existing data (Order matters for foreign keys) ──
  try {
    await db.ticketMessage.deleteMany();
    await db.ticket.deleteMany();
    await db.auditLog.deleteMany();
    await db.submission.deleteMany();
    await db.assignment.deleteMany();
    await db.grade.deleteMany();
    await db.attendance.deleteMany();
    await db.fee.deleteMany();
    await db.timetable.deleteMany();
    await db.subject.deleteMany();
    await db.classTeacher.deleteMany();
    await db.student.deleteMany();
    await db.teacher.deleteMany();
    await db.parent.deleteMany();
    await db.class.deleteMany();
    await db.notice.deleteMany();
    await db.event.deleteMany();
    await db.subscription.deleteMany();
    await db.user.deleteMany();
    await db.customRole.deleteMany();
    await db.platformRole.deleteMany();
    await db.tenant.deleteMany();
    await db.platformSetting.deleteMany();
    
    console.log('✅ All existing records purged.');
  } catch (error) {
    console.warn('⚠️ Cleanup warning (some tables might be empty):', error);
  }

  // ── Seeding Only Essential Data ──
  console.log('🌱 Seeding root Super Admin...');
  
  await db.platformSetting.create({
    data: { key: 'maintenance_mode', value: 'false' }
  });

  const hashedPassword = await bcrypt.hash('test@123', 10);

  // Create Super Admin - Clean slate, known credentials
  await db.user.create({
    data: {
      email: 'shoaibalamcse0786@gmail.com',
      name: 'Super Admin',
      role: 'super_admin',
      password: hashedPassword,
      phone: '000-0000',
    }
  });

  console.log('✨ Success! Database is now empty and ready for fresh testing.');
  console.log('🔑 Login: shoaibalamcse0786@gmail.com / test@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
