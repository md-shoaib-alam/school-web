import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateApiRequest } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

export async function POST() {
  // CRITICAL: Block seeding in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding is disabled in production' }, { status: 403 });
  }

  // 🔒 Security: Only super_admin can trigger database seed
  const { error, user } = await validateApiRequest();
  if (error) return error;
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // =========== CLEANUP - Delete ALL data in correct dependency order ===========
    // First delete records with foreign keys referencing other tables
    await db.ticketMessage.deleteMany();
    await db.ticket.deleteMany();
    await db.subscription.deleteMany();
    await db.submission.deleteMany();
    await db.assignment.deleteMany();
    await db.grade.deleteMany();
    await db.attendance.deleteMany();
    await db.timetable.deleteMany();
    await db.fee.deleteMany();
    await db.notice.deleteMany();
    await db.event.deleteMany();
    await db.classTeacher.deleteMany();
    await db.subject.deleteMany();
    await db.student.deleteMany();
    await db.teacher.deleteMany();
    await db.parent.deleteMany();
    await db.class.deleteMany();
    await db.user.deleteMany();
    // Then delete records referencing tenant
    await db.customRole.deleteMany();
    await db.auditLog.deleteMany();
    await db.platformSetting.deleteMany();
    await db.platformRole.deleteMany();
    // Finally delete tenants
    await db.tenant.deleteMany();

    // =========== TENANT ===========
    const tenant = await db.tenant.create({
      data: {
        name: 'Sigel School',
        slug: 'sigel',
        plan: 'premium',
        status: 'active',
        maxStudents: 500,
        maxTeachers: 50,
        maxParents: 500,
        maxClasses: 20,
        settings: JSON.stringify({ theme: 'light', language: 'en', currency: 'INR' }),
        startDate: '2024-04-01',
        endDate: '2026-03-31',
        email: 'info@sigel.edu',
        phone: '555-0100',
        address: '123 Education Lane, Academic City, 560001',
        website: 'https://sigel.edu',
      }
    });

    // 🔒 Hash the default password for all seed users
    const hashedPassword = await bcrypt.hash('sigel2024', 12);

    // =========== SUPER ADMIN (no tenantId) ===========
    const superAdmin = await db.user.create({
      data: { email: 'superadmin@schoolsaas.com', name: 'James Wilson', role: 'super_admin', phone: '555-0001', password: hashedPassword }
    });

    // =========== USERS (with tenantId) ===========
    const admin = await db.user.create({
      data: { email: 'admin@sigel.edu', name: 'Dr. Margaret Chen', role: 'admin', phone: '555-0100', address: 'Sigel School, Main Office', tenantId: tenant.id, password: hashedPassword }
    });

    // 12 Teachers
    const teacherUsers = await Promise.all([
      db.user.create({ data: { email: 'john.smith@sigel.edu', name: 'Mr. John Smith', role: 'teacher', phone: '555-0101', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'sarah.jones@sigel.edu', name: 'Ms. Sarah Jones', role: 'teacher', phone: '555-0102', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'raj.patel@sigel.edu', name: 'Mr. Raj Patel', role: 'teacher', phone: '555-0103', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'emily.davis@sigel.edu', name: 'Ms. Emily Davis', role: 'teacher', phone: '555-0104', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'mike.wilson@sigel.edu', name: 'Mr. Mike Wilson', role: 'teacher', phone: '555-0105', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'linda.taylor@sigel.edu', name: 'Ms. Linda Taylor', role: 'teacher', phone: '555-0106', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'james.brown@sigel.edu', name: 'Mr. James Brown', role: 'teacher', phone: '555-0107', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'priya.sharma@sigel.edu', name: 'Ms. Priya Sharma', role: 'teacher', phone: '555-0108', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'tom.garcia@sigel.edu', name: 'Mr. Tom Garcia', role: 'teacher', phone: '555-0109', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'nina.ross@sigel.edu', name: 'Ms. Nina Ross', role: 'teacher', phone: '555-0110', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'david.kim@sigel.edu', name: 'Mr. David Kim', role: 'teacher', phone: '555-0111', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'anna.white@sigel.edu', name: 'Ms. Anna White', role: 'teacher', phone: '555-0112', tenantId: tenant.id, password: hashedPassword } }),
    ]);

    // 12 Parents
    const parentUsers = await Promise.all([
      db.user.create({ data: { email: 'parent1@sigel.edu', name: 'Robert Anderson', role: 'parent', phone: '555-0201', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent2@sigel.edu', name: 'Lisa Thompson', role: 'parent', phone: '555-0202', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent3@sigel.edu', name: 'David Martinez', role: 'parent', phone: '555-0203', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent4@sigel.edu', name: 'Susan Clark', role: 'parent', phone: '555-0204', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent5@sigel.edu', name: 'James Lee', role: 'parent', phone: '555-0205', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent6@sigel.edu', name: 'Karen Walker', role: 'parent', phone: '555-0206', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent7@sigel.edu', name: 'Michael Robinson', role: 'parent', phone: '555-0207', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent8@sigel.edu', name: 'Patricia Hall', role: 'parent', phone: '555-0208', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent9@sigel.edu', name: 'Steven Young', role: 'parent', phone: '555-0209', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent10@sigel.edu', name: 'Jennifer King', role: 'parent', phone: '555-0210', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent11@sigel.edu', name: 'William Wright', role: 'parent', phone: '555-0211', tenantId: tenant.id, password: hashedPassword } }),
      db.user.create({ data: { email: 'parent12@sigel.edu', name: 'Elizabeth Scott', role: 'parent', phone: '555-0212', tenantId: tenant.id, password: hashedPassword } }),
    ]);

    // =========== CLASSES (with tenantId) ===========
    const classes = await Promise.all([
      db.class.create({ data: { name: 'Class 8', section: 'A', grade: '8', capacity: 40, tenantId: tenant.id } }),
      db.class.create({ data: { name: 'Class 8', section: 'B', grade: '8', capacity: 35, tenantId: tenant.id } }),
      db.class.create({ data: { name: 'Class 9', section: 'A', grade: '9', capacity: 40, tenantId: tenant.id } }),
      db.class.create({ data: { name: 'Class 9', section: 'B', grade: '9', capacity: 35, tenantId: tenant.id } }),
      db.class.create({ data: { name: 'Class 10', section: 'A', grade: '10', capacity: 40, tenantId: tenant.id } }),
      db.class.create({ data: { name: 'Class 10', section: 'B', grade: '10', capacity: 35, tenantId: tenant.id } }),
      db.class.create({ data: { name: 'Class 11', section: 'A', grade: '11', capacity: 40, tenantId: tenant.id } }),
      db.class.create({ data: { name: 'Class 12', section: 'A', grade: '12', capacity: 35, tenantId: tenant.id } }),
    ]);

    // =========== TEACHERS ===========
    const teachers = await Promise.all([
      db.teacher.create({ data: { userId: teacherUsers[0].id, qualification: 'M.Sc Mathematics', experience: '12 years', joiningDate: '2020-06-01' } }),
      db.teacher.create({ data: { userId: teacherUsers[1].id, qualification: 'M.A English', experience: '8 years', joiningDate: '2021-07-15' } }),
      db.teacher.create({ data: { userId: teacherUsers[2].id, qualification: 'M.Sc Physics', experience: '10 years', joiningDate: '2019-08-01' } }),
      db.teacher.create({ data: { userId: teacherUsers[3].id, qualification: 'M.Sc Chemistry', experience: '6 years', joiningDate: '2022-01-10' } }),
      db.teacher.create({ data: { userId: teacherUsers[4].id, qualification: 'M.A History', experience: '15 years', joiningDate: '2018-04-01' } }),
      db.teacher.create({ data: { userId: teacherUsers[5].id, qualification: 'M.Sc Biology', experience: '9 years', joiningDate: '2020-03-15' } }),
      db.teacher.create({ data: { userId: teacherUsers[6].id, qualification: 'M.A Geography', experience: '7 years', joiningDate: '2021-06-01' } }),
      db.teacher.create({ data: { userId: teacherUsers[7].id, qualification: 'M.Sc Computer Science', experience: '5 years', joiningDate: '2022-07-01' } }),
      db.teacher.create({ data: { userId: teacherUsers[8].id, qualification: 'M.P.Ed Physical Education', experience: '11 years', joiningDate: '2019-01-15' } }),
      db.teacher.create({ data: { userId: teacherUsers[9].id, qualification: 'M.A Economics', experience: '8 years', joiningDate: '2020-08-01' } }),
      db.teacher.create({ data: { userId: teacherUsers[10].id, qualification: 'B.Ed Hindi', experience: '13 years', joiningDate: '2017-06-01' } }),
      db.teacher.create({ data: { userId: teacherUsers[11].id, qualification: 'M.A Art', experience: '6 years', joiningDate: '2023-01-10' } }),
    ]);

    // =========== PARENTS ===========
    const parents = await Promise.all([
      db.parent.create({ data: { userId: parentUsers[0].id, occupation: 'Engineer' } }),
      db.parent.create({ data: { userId: parentUsers[1].id, occupation: 'Doctor' } }),
      db.parent.create({ data: { userId: parentUsers[2].id, occupation: 'Business Owner' } }),
      db.parent.create({ data: { userId: parentUsers[3].id, occupation: 'Teacher' } }),
      db.parent.create({ data: { userId: parentUsers[4].id, occupation: 'Lawyer' } }),
      db.parent.create({ data: { userId: parentUsers[5].id, occupation: 'Accountant' } }),
      db.parent.create({ data: { userId: parentUsers[6].id, occupation: 'Architect' } }),
      db.parent.create({ data: { userId: parentUsers[7].id, occupation: 'Nurse' } }),
      db.parent.create({ data: { userId: parentUsers[8].id, occupation: 'Police Officer' } }),
      db.parent.create({ data: { userId: parentUsers[9].id, occupation: 'Software Developer' } }),
      db.parent.create({ data: { userId: parentUsers[10].id, occupation: 'Farmer' } }),
      db.parent.create({ data: { userId: parentUsers[11].id, occupation: 'Bank Manager' } }),
    ]);

    // =========== STUDENTS ===========
    // 50 students across 8 classes
    const studentData = [
      // Class 8A - 8 students
      { name: 'Aiden Brooks', email: 'aiden.s@sigel.edu', classId: classes[0].id, parentId: parents[0].id, roll: '8A-001', gender: 'male', dob: '2011-03-15' },
      { name: 'Chloe Evans', email: 'chloe.s@sigel.edu', classId: classes[0].id, parentId: parents[1].id, roll: '8A-002', gender: 'female', dob: '2011-07-22' },
      { name: 'Daniel Foster', email: 'daniel.s@sigel.edu', classId: classes[0].id, parentId: parents[2].id, roll: '8A-003', gender: 'male', dob: '2011-01-08' },
      { name: 'Emma Green', email: 'emma.s@sigel.edu', classId: classes[0].id, parentId: parents[3].id, roll: '8A-004', gender: 'female', dob: '2011-05-30' },
      { name: 'Ryan Hayes', email: 'ryan.s@sigel.edu', classId: classes[0].id, parentId: parents[4].id, roll: '8A-005', gender: 'male', dob: '2011-09-12' },
      { name: 'Sophia Turner', email: 'sophia.s@sigel.edu', classId: classes[0].id, parentId: parents[5].id, roll: '8A-006', gender: 'female', dob: '2011-11-25' },
      { name: 'Marcus Phillips', email: 'marcus.s@sigel.edu', classId: classes[0].id, parentId: parents[6].id, roll: '8A-007', gender: 'male', dob: '2011-02-14' },
      { name: 'Zoe Campbell', email: 'zoe.s@sigel.edu', classId: classes[0].id, parentId: parents[7].id, roll: '8A-008', gender: 'female', dob: '2011-06-18' },

      // Class 8B - 6 students
      { name: 'Luke Parker', email: 'luke.s@sigel.edu', classId: classes[1].id, parentId: parents[8].id, roll: '8B-001', gender: 'male', dob: '2011-04-20' },
      { name: 'Mia Stewart', email: 'mia.s@sigel.edu', classId: classes[1].id, parentId: parents[9].id, roll: '8B-002', gender: 'female', dob: '2011-08-11' },
      { name: 'Owen Morris', email: 'owen.s@sigel.edu', classId: classes[1].id, parentId: parents[10].id, roll: '8B-003', gender: 'male', dob: '2011-12-01' },
      { name: 'Lily Rogers', email: 'lily.s@sigel.edu', classId: classes[1].id, parentId: parents[11].id, roll: '8B-004', gender: 'female', dob: '2011-03-28' },
      { name: 'Jack Peterson', email: 'jack.s@sigel.edu', classId: classes[1].id, parentId: parents[0].id, roll: '8B-005', gender: 'male', dob: '2011-07-15' },
      { name: 'Ava Bailey', email: 'ava.s@sigel.edu', classId: classes[1].id, parentId: parents[1].id, roll: '8B-006', gender: 'female', dob: '2011-10-09' },

      // Class 9A - 8 students
      { name: 'Alex Anderson', email: 'alex.s@sigel.edu', classId: classes[2].id, parentId: parents[2].id, roll: '9A-001', gender: 'male', dob: '2010-03-15' },
      { name: 'Bella Thompson', email: 'bella.s@sigel.edu', classId: classes[2].id, parentId: parents[3].id, roll: '9A-002', gender: 'female', dob: '2010-07-22' },
      { name: 'Carlos Martinez', email: 'carlos.s@sigel.edu', classId: classes[2].id, parentId: parents[4].id, roll: '9A-003', gender: 'male', dob: '2010-11-08' },
      { name: 'Diana Clark', email: 'diana.s@sigel.edu', classId: classes[2].id, parentId: parents[5].id, roll: '9A-004', gender: 'female', dob: '2010-01-30' },
      { name: 'Ethan Lee', email: 'ethan.s@sigel.edu', classId: classes[2].id, parentId: parents[6].id, roll: '9A-005', gender: 'male', dob: '2010-05-12' },
      { name: 'Fiona Garcia', email: 'fiona.s@sigel.edu', classId: classes[2].id, parentId: parents[7].id, roll: '9A-006', gender: 'female', dob: '2010-09-25' },
      { name: 'George Kim', email: 'george.s@sigel.edu', classId: classes[2].id, parentId: parents[8].id, roll: '9A-007', gender: 'male', dob: '2010-12-01' },
      { name: 'Hannah Brown', email: 'hannah.s@sigel.edu', classId: classes[2].id, parentId: parents[9].id, roll: '9A-008', gender: 'female', dob: '2010-02-14' },

      // Class 9B - 6 students
      { name: 'Ivy Richardson', email: 'ivy.s@sigel.edu', classId: classes[3].id, parentId: parents[10].id, roll: '9B-001', gender: 'female', dob: '2010-06-18' },
      { name: 'Jacob Cooper', email: 'jacob.s@sigel.edu', classId: classes[3].id, parentId: parents[11].id, roll: '9B-002', gender: 'male', dob: '2010-10-05' },
      { name: 'Kayla Reed', email: 'kayla.s@sigel.edu', classId: classes[3].id, parentId: parents[0].id, roll: '9B-003', gender: 'female', dob: '2010-04-20' },
      { name: 'Liam Morgan', email: 'liam.s@sigel.edu', classId: classes[3].id, parentId: parents[1].id, roll: '9B-004', gender: 'male', dob: '2010-08-11' },
      { name: 'Nora Bell', email: 'nora.s@sigel.edu', classId: classes[3].id, parentId: parents[2].id, roll: '9B-005', gender: 'female', dob: '2010-01-07' },
      { name: 'Oscar Murphy', email: 'oscar.s@sigel.edu', classId: classes[3].id, parentId: parents[3].id, roll: '9B-006', gender: 'male', dob: '2010-03-28' },

      // Class 10A - 7 students
      { name: 'Ivan Wilson', email: 'ivan.s@sigel.edu', classId: classes[4].id, parentId: parents[4].id, roll: '10A-001', gender: 'male', dob: '2009-06-18' },
      { name: 'Julia Davis', email: 'julia.s@sigel.edu', classId: classes[4].id, parentId: parents[5].id, roll: '10A-002', gender: 'female', dob: '2009-10-05' },
      { name: 'Kevin Taylor', email: 'kevin.s@sigel.edu', classId: classes[4].id, parentId: parents[6].id, roll: '10A-003', gender: 'male', dob: '2009-04-20' },
      { name: 'Laura Moore', email: 'laura.s@sigel.edu', classId: classes[4].id, parentId: parents[7].id, roll: '10A-004', gender: 'female', dob: '2009-08-11' },
      { name: 'Nathan White', email: 'nathan.s@sigel.edu', classId: classes[4].id, parentId: parents[8].id, roll: '10A-005', gender: 'male', dob: '2009-01-07' },
      { name: 'Olivia Harris', email: 'olivia.s@sigel.edu', classId: classes[4].id, parentId: parents[9].id, roll: '10A-006', gender: 'female', dob: '2009-03-28' },
      { name: 'Peter Clark', email: 'peter.s@sigel.edu', classId: classes[4].id, parentId: parents[10].id, roll: '10A-007', gender: 'male', dob: '2009-07-15' },

      // Class 10B - 5 students
      { name: 'Rachel Adams', email: 'rachel.s@sigel.edu', classId: classes[5].id, parentId: parents[11].id, roll: '10B-001', gender: 'female', dob: '2009-02-14' },
      { name: 'Samuel Nelson', email: 'samuel.s@sigel.edu', classId: classes[5].id, parentId: parents[0].id, roll: '10B-002', gender: 'male', dob: '2009-05-20' },
      { name: 'Tara Hill', email: 'tara.s@sigel.edu', classId: classes[5].id, parentId: parents[1].id, roll: '10B-003', gender: 'female', dob: '2009-09-08' },
      { name: 'Victor Baker', email: 'victor.s@sigel.edu', classId: classes[5].id, parentId: parents[2].id, roll: '10B-004', gender: 'male', dob: '2009-11-30' },
      { name: 'Wendy Rivera', email: 'wendy.s@sigel.edu', classId: classes[5].id, parentId: parents[3].id, roll: '10B-005', gender: 'female', dob: '2009-04-17' },

      // Class 11A - 6 students
      { name: 'Xavier Foster', email: 'xavier.s@sigel.edu', classId: classes[6].id, parentId: parents[4].id, roll: '11A-001', gender: 'male', dob: '2008-01-22' },
      { name: 'Yara Singh', email: 'yara.s@sigel.edu', classId: classes[6].id, parentId: parents[5].id, roll: '11A-002', gender: 'female', dob: '2008-06-15' },
      { name: 'Zach Price', email: 'zach.s@sigel.edu', classId: classes[6].id, parentId: parents[6].id, roll: '11A-003', gender: 'male', dob: '2008-09-30' },
      { name: 'Alice Hughes', email: 'alice.s@sigel.edu', classId: classes[6].id, parentId: parents[7].id, roll: '11A-004', gender: 'female', dob: '2008-03-11' },
      { name: 'Brandon Flores', email: 'brandon.s@sigel.edu', classId: classes[6].id, parentId: parents[8].id, roll: '11A-005', gender: 'male', dob: '2008-12-05' },
      { name: 'Carmen Gomez', email: 'carmen.s@sigel.edu', classId: classes[6].id, parentId: parents[9].id, roll: '11A-006', gender: 'female', dob: '2008-07-25' },

      // Class 12A - 5 students
      { name: 'Derek Washington', email: 'derek.s@sigel.edu', classId: classes[7].id, parentId: parents[10].id, roll: '12A-001', gender: 'male', dob: '2007-02-08' },
      { name: 'Elena Torres', email: 'elena.s@sigel.edu', classId: classes[7].id, parentId: parents[11].id, roll: '12A-002', gender: 'female', dob: '2007-05-19' },
      { name: 'Frank Nguyen', email: 'frank.s@sigel.edu', classId: classes[7].id, parentId: parents[0].id, roll: '12A-003', gender: 'male', dob: '2007-10-03' },
      { name: 'Grace Chen', email: 'grace.s@sigel.edu', classId: classes[7].id, parentId: parents[1].id, roll: '12A-004', gender: 'female', dob: '2007-08-27' },
      { name: 'Henry Patel', email: 'henry.s@sigel.edu', classId: classes[7].id, parentId: parents[2].id, roll: '12A-005', gender: 'male', dob: '2007-04-14' },
    ];

    const studentUsers = await Promise.all(
      studentData.map((s, i) => db.user.create({
        data: { email: s.email, name: s.name, role: 'student', phone: `555-03${String(i + 1).padStart(3, '0')}`, tenantId: tenant.id, password: hashedPassword }
      }))
    );

    const students = await Promise.all(
      studentData.map((s, i) => db.student.create({
        data: { userId: studentUsers[i].id, rollNumber: s.roll, classId: s.classId, parentId: s.parentId, dateOfBirth: s.dob, gender: s.gender }
      }))
    );

    // =========== CLASS TEACHERS ===========
    await Promise.all([
      // Class 8A
      db.classTeacher.create({ data: { classId: classes[0].id, teacherId: teachers[0].id, isClassTeacher: true } }),
      db.classTeacher.create({ data: { classId: classes[0].id, teacherId: teachers[1].id, isClassTeacher: false } }),
      db.classTeacher.create({ data: { classId: classes[0].id, teacherId: teachers[5].id, isClassTeacher: false } }),
      // Class 8B
      db.classTeacher.create({ data: { classId: classes[1].id, teacherId: teachers[5].id, isClassTeacher: true } }),
      db.classTeacher.create({ data: { classId: classes[1].id, teacherId: teachers[0].id, isClassTeacher: false } }),
      db.classTeacher.create({ data: { classId: classes[1].id, teacherId: teachers[1].id, isClassTeacher: false } }),
      // Class 9A
      db.classTeacher.create({ data: { classId: classes[2].id, teacherId: teachers[2].id, isClassTeacher: true } }),
      db.classTeacher.create({ data: { classId: classes[2].id, teacherId: teachers[0].id, isClassTeacher: false } }),
      db.classTeacher.create({ data: { classId: classes[2].id, teacherId: teachers[1].id, isClassTeacher: false } }),
      db.classTeacher.create({ data: { classId: classes[2].id, teacherId: teachers[3].id, isClassTeacher: false } }),
      // Class 9B
      db.classTeacher.create({ data: { classId: classes[3].id, teacherId: teachers[3].id, isClassTeacher: true } }),
      db.classTeacher.create({ data: { classId: classes[3].id, teacherId: teachers[2].id, isClassTeacher: false } }),
      db.classTeacher.create({ data: { classId: classes[3].id, teacherId: teachers[0].id, isClassTeacher: false } }),
      // Class 10A
      db.classTeacher.create({ data: { classId: classes[4].id, teacherId: teachers[1].id, isClassTeacher: true } }),
      db.classTeacher.create({ data: { classId: classes[4].id, teacherId: teachers[0].id, isClassTeacher: false } }),
      db.classTeacher.create({ data: { classId: classes[4].id, teacherId: teachers[4].id, isClassTeacher: false } }),
      // Class 10B
      db.classTeacher.create({ data: { classId: classes[5].id, teacherId: teachers[4].id, isClassTeacher: true } }),
      db.classTeacher.create({ data: { classId: classes[5].id, teacherId: teachers[2].id, isClassTeacher: false } }),
      db.classTeacher.create({ data: { classId: classes[5].id, teacherId: teachers[3].id, isClassTeacher: false } }),
      // Class 11A
      db.classTeacher.create({ data: { classId: classes[6].id, teacherId: teachers[6].id, isClassTeacher: true } }),
      db.classTeacher.create({ data: { classId: classes[6].id, teacherId: teachers[7].id, isClassTeacher: false } }),
      db.classTeacher.create({ data: { classId: classes[6].id, teacherId: teachers[9].id, isClassTeacher: false } }),
      // Class 12A
      db.classTeacher.create({ data: { classId: classes[7].id, teacherId: teachers[10].id, isClassTeacher: true } }),
      db.classTeacher.create({ data: { classId: classes[7].id, teacherId: teachers[0].id, isClassTeacher: false } }),
      db.classTeacher.create({ data: { classId: classes[7].id, teacherId: teachers[2].id, isClassTeacher: false } }),
    ]);

    // =========== SUBJECTS ===========
    // Each class gets 5-6 subjects
    const subjectData = [
      // Class 8A
      { name: 'Mathematics', code: 'MATH-801', classId: classes[0].id, teacherId: teachers[0].id },
      { name: 'English', code: 'ENG-801', classId: classes[0].id, teacherId: teachers[1].id },
      { name: 'Science', code: 'SCI-801', classId: classes[0].id, teacherId: teachers[2].id },
      { name: 'History', code: 'HIS-801', classId: classes[0].id, teacherId: teachers[4].id },
      { name: 'Hindi', code: 'HIN-801', classId: classes[0].id, teacherId: teachers[10].id },
      // Class 8B
      { name: 'Mathematics', code: 'MATH-802', classId: classes[1].id, teacherId: teachers[0].id },
      { name: 'English', code: 'ENG-802', classId: classes[1].id, teacherId: teachers[1].id },
      { name: 'Science', code: 'SCI-802', classId: classes[1].id, teacherId: teachers[5].id },
      { name: 'Geography', code: 'GEO-801', classId: classes[1].id, teacherId: teachers[6].id },
      // Class 9A
      { name: 'Mathematics', code: 'MATH-901', classId: classes[2].id, teacherId: teachers[0].id },
      { name: 'English', code: 'ENG-901', classId: classes[2].id, teacherId: teachers[1].id },
      { name: 'Physics', code: 'PHY-901', classId: classes[2].id, teacherId: teachers[2].id },
      { name: 'Chemistry', code: 'CHEM-901', classId: classes[2].id, teacherId: teachers[3].id },
      { name: 'Biology', code: 'BIO-901', classId: classes[2].id, teacherId: teachers[5].id },
      // Class 9B
      { name: 'Mathematics', code: 'MATH-902', classId: classes[3].id, teacherId: teachers[0].id },
      { name: 'English', code: 'ENG-902', classId: classes[3].id, teacherId: teachers[1].id },
      { name: 'Physics', code: 'PHY-902', classId: classes[3].id, teacherId: teachers[2].id },
      { name: 'History', code: 'HIS-901', classId: classes[3].id, teacherId: teachers[4].id },
      // Class 10A
      { name: 'Mathematics', code: 'MATH-1001', classId: classes[4].id, teacherId: teachers[0].id },
      { name: 'English', code: 'ENG-1001', classId: classes[4].id, teacherId: teachers[1].id },
      { name: 'Physics', code: 'PHY-1001', classId: classes[4].id, teacherId: teachers[2].id },
      { name: 'Chemistry', code: 'CHEM-1001', classId: classes[4].id, teacherId: teachers[3].id },
      { name: 'History', code: 'HIS-1001', classId: classes[4].id, teacherId: teachers[4].id },
      { name: 'Computer Science', code: 'CS-1001', classId: classes[4].id, teacherId: teachers[7].id },
      // Class 10B
      { name: 'Mathematics', code: 'MATH-1002', classId: classes[5].id, teacherId: teachers[0].id },
      { name: 'English', code: 'ENG-1002', classId: classes[5].id, teacherId: teachers[1].id },
      { name: 'Biology', code: 'BIO-1001', classId: classes[5].id, teacherId: teachers[5].id },
      { name: 'Economics', code: 'ECO-1001', classId: classes[5].id, teacherId: teachers[9].id },
      // Class 11A
      { name: 'Physics', code: 'PHY-1101', classId: classes[6].id, teacherId: teachers[2].id },
      { name: 'Chemistry', code: 'CHEM-1101', classId: classes[6].id, teacherId: teachers[3].id },
      { name: 'Mathematics', code: 'MATH-1101', classId: classes[6].id, teacherId: teachers[0].id },
      { name: 'English', code: 'ENG-1101', classId: classes[6].id, teacherId: teachers[1].id },
      { name: 'Computer Science', code: 'CS-1101', classId: classes[6].id, teacherId: teachers[7].id },
      { name: 'Physical Education', code: 'PE-1101', classId: classes[6].id, teacherId: teachers[8].id },
      // Class 12A
      { name: 'Physics', code: 'PHY-1201', classId: classes[7].id, teacherId: teachers[2].id },
      { name: 'Chemistry', code: 'CHEM-1201', classId: classes[7].id, teacherId: teachers[3].id },
      { name: 'Mathematics', code: 'MATH-1201', classId: classes[7].id, teacherId: teachers[0].id },
      { name: 'Hindi', code: 'HIN-1201', classId: classes[7].id, teacherId: teachers[10].id },
      { name: 'Art', code: 'ART-1201', classId: classes[7].id, teacherId: teachers[11].id },
    ];

    const subjects = await Promise.all(subjectData.map(s => db.subject.create({ data: s })));

    // =========== ATTENDANCE (60 days) ===========
    const statuses = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'absent', 'late', 'present'];
    for (let d = 0; d < 60; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      const dateStr = date.toISOString().split('T')[0];

      const records = students.map(student => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        return {
          studentId: student.id,
          classId: student.classId,
          date: dateStr,
          status,
        };
      });

      await db.attendance.createMany({ data: records });
    }

    // =========== GRADES ===========
    const examTypes = ['midterm', 'final', 'quiz', 'assignment'];
    for (const student of students) {
      const classSubjects = subjects.filter(s => s.classId === student.classId);
      for (const subject of classSubjects) {
        for (const examType of examTypes) {
          const maxMarks = examType === 'quiz' ? 20 : examType === 'midterm' ? 50 : examType === 'assignment' ? 25 : 100;
          const rawMarks = Math.random() * (maxMarks * 0.5) + maxMarks * 0.5;
          const marks = Math.round(rawMarks * 10) / 10;
          const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : marks >= 60 ? 'B' : marks >= 50 ? 'C' : 'D';
          await db.grade.create({
            data: {
              studentId: student.id,
              subjectId: subject.id,
              teacherId: subject.teacherId || teachers[0].id,
              examType,
              marks,
              maxMarks,
              grade,
            }
          });
        }
      }
    }

    // =========== ASSIGNMENTS ===========
    const assignmentData = [
      { subjectIdx: 0, classIdx: 0, teacherIdx: 0, title: 'Algebra Fundamentals', desc: 'Complete exercises 1-30 from Chapter 3 on Linear Equations', due: '2025-02-15' },
      { subjectIdx: 1, classIdx: 0, teacherIdx: 1, title: 'Essay: My Hometown', desc: 'Write a 500-word descriptive essay about your hometown', due: '2025-02-20' },
      { subjectIdx: 2, classIdx: 0, teacherIdx: 2, title: 'Simple Machines Lab', desc: 'Identify 10 simple machines at home and explain their mechanical advantage', due: '2025-02-18' },
      { subjectIdx: 5, classIdx: 1, teacherIdx: 0, title: 'Geometry Problems', desc: 'Solve all problems from the triangles and circles worksheet', due: '2025-02-22' },
      { subjectIdx: 6, classIdx: 1, teacherIdx: 1, title: 'Book Review: To Kill a Mockingbird', desc: 'Write a comprehensive book review analyzing themes and characters', due: '2025-02-25' },
      { subjectIdx: 8, classIdx: 2, teacherIdx: 0, title: 'Quadratic Equations', desc: 'Solve 25 quadratic equations using different methods', due: '2025-03-01' },
      { subjectIdx: 9, classIdx: 2, teacherIdx: 1, title: 'Shakespeare Analysis', desc: 'Analyze Act 3 of Hamlet in 800 words with critical evaluation', due: '2025-02-28' },
      { subjectIdx: 10, classIdx: 2, teacherIdx: 2, title: 'Newton\'s Laws Worksheet', desc: 'Complete all problems related to Newton\'s three laws of motion', due: '2025-03-05' },
      { subjectIdx: 11, classIdx: 2, teacherIdx: 3, title: 'Chemical Bonding Report', desc: 'Prepare a detailed report on ionic and covalent bonds with examples', due: '2025-03-02' },
      { subjectIdx: 14, classIdx: 3, teacherIdx: 0, title: 'Statistics Project', desc: 'Collect data from 50 people and create frequency distribution tables', due: '2025-03-10' },
      { subjectIdx: 16, classIdx: 4, teacherIdx: 0, title: 'Trigonometry Problems', desc: 'Solve all problems from the trigonometry worksheet (Ch 7-8)', due: '2025-02-18' },
      { subjectIdx: 17, classIdx: 4, teacherIdx: 1, title: 'Poetry Analysis', desc: 'Analyze 3 poems by Robert Frost focusing on imagery and symbolism', due: '2025-02-25' },
      { subjectIdx: 18, classIdx: 4, teacherIdx: 2, title: 'Mechanics Lab Report', desc: 'Write a detailed lab report on the pendulum experiment', due: '2025-02-22' },
      { subjectIdx: 19, classIdx: 4, teacherIdx: 3, title: 'Organic Chemistry Basics', desc: 'Draw structures and name 20 organic compounds', due: '2025-03-01' },
      { subjectIdx: 21, classIdx: 4, teacherIdx: 7, title: 'Python Programming', desc: 'Create a student management system using Python and SQLite', due: '2025-03-15' },
      { subjectIdx: 24, classIdx: 5, teacherIdx: 5, title: 'Human Anatomy Diagram', desc: 'Draw and label all major organs of the human body', due: '2025-03-05' },
      { subjectIdx: 25, classIdx: 5, teacherIdx: 9, title: 'Market Survey Report', desc: 'Conduct a market survey of 30 households and analyze spending patterns', due: '2025-03-10' },
      { subjectIdx: 26, classIdx: 6, teacherIdx: 2, title: 'Electromagnetic Theory', desc: 'Solve 30 problems on electromagnetic induction and Faraday\'s law', due: '2025-03-08' },
      { subjectIdx: 27, classIdx: 6, teacherIdx: 3, title: 'Chemical Kinetics', desc: 'Determine rate laws for 5 given experimental data sets', due: '2025-03-12' },
      { subjectIdx: 29, classIdx: 6, teacherIdx: 7, title: 'Web Development Project', desc: 'Build a responsive school website using HTML, CSS, and JavaScript', due: '2025-03-20' },
    ];

    const assignments = await Promise.all(
      assignmentData.map(a => db.assignment.create({
        data: {
          subjectId: subjects[a.subjectIdx].id,
          classId: classes[a.classIdx].id,
          teacherId: teachers[a.teacherIdx].id,
          title: a.title,
          description: a.desc,
          dueDate: a.due,
        }
      }))
    );

    // =========== SUBMISSIONS ===========
    for (const assignment of assignments) {
      const classStudents = students.filter(s => s.classId === assignment.classId);
      const submissions = classStudents
        .filter(() => Math.random() > 0.25)
        .map(student => ({
          assignmentId: assignment.id,
          studentId: student.id,
          content: 'Completed assignment submission',
          status: Math.random() > 0.4 ? 'graded' : 'submitted',
          grade: Math.random() > 0.4 ? String.fromCharCode(65 + Math.floor(Math.random() * 5)) : null,
          feedback: Math.random() > 0.4 ? ['Good work!', 'Needs improvement in presentation', 'Excellent analysis', 'Well done, keep it up!', 'Please review chapter 5 again'][Math.floor(Math.random() * 5)] : null,
        }));
      if (submissions.length > 0) {
        await db.submission.createMany({ data: submissions });
      }
    }

    // =========== FEES ===========
    const feeTypes = ['tuition', 'exam', 'library', 'transport', 'lab', 'sports'];
    const feeStatuses = ['paid', 'paid', 'paid', 'pending', 'overdue', 'paid'];
    for (const student of students) {
      for (const type of feeTypes) {
        const amount = type === 'tuition' ? 5000 : type === 'transport' ? 2000 : type === 'lab' ? 1000 : type === 'sports' ? 800 : 500;
        const status = feeStatuses[Math.floor(Math.random() * feeStatuses.length)];
        await db.fee.create({
          data: {
            studentId: student.id,
            amount,
            type,
            status,
            dueDate: `${2025}-${String(Math.floor(Math.random() * 3) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            paidAmount: status === 'paid' ? amount : status === 'partial' ? amount / 2 : 0,
            paidDate: status === 'paid' ? '2025-01-15' : null,
          }
        });
      }
    }

    // =========== NOTICES (with tenantId) ===========
    await Promise.all([
      db.notice.create({ data: { title: 'Annual Sports Day', content: 'Annual Sports Day will be held on March 15, 2025. All students must participate. Registration forms available at the front office. Events include track and field, basketball, football, and swimming.', authorId: admin.id, tenantId: tenant.id, targetRole: 'all', priority: 'important' } }),
      db.notice.create({ data: { title: 'Parent-Teacher Meeting', content: 'PTM scheduled for February 28, 2025 from 9 AM to 1 PM. All parents are requested to attend. Please bring your child\'s progress report.', authorId: admin.id, tenantId: tenant.id, targetRole: 'parent', priority: 'important' } }),
      db.notice.create({ data: { title: 'Mid-Term Exam Schedule', content: 'Mid-term examinations will commence from March 1, 2025. Detailed schedule has been shared with class teachers. Students must carry their hall tickets.', authorId: admin.id, tenantId: tenant.id, targetRole: 'all', priority: 'urgent' } }),
      db.notice.create({ data: { title: 'Staff Development Workshop', content: 'A professional development workshop on modern teaching methods is scheduled for February 22, 2025. Attendance is mandatory for all teachers.', authorId: admin.id, tenantId: tenant.id, targetRole: 'teacher', priority: 'normal' } }),
      db.notice.create({ data: { title: 'Library Hours Extended', content: 'The school library will remain open until 6 PM during exam season starting February 15. New reference books for Grade 11 and 12 have been added.', authorId: admin.id, tenantId: tenant.id, targetRole: 'all', priority: 'normal' } }),
      db.notice.create({ data: { title: 'Science Fair Registration', content: 'Students interested in participating in the Annual Science Fair must register with their science teacher by March 5. Projects can be individual or in teams of 2-3.', authorId: admin.id, tenantId: tenant.id, targetRole: 'student', priority: 'important' } }),
      db.notice.create({ data: { title: 'Winter Vacation Homework', content: 'All students must complete their winter vacation homework by January 10. Late submissions will not be accepted.', authorId: admin.id, tenantId: tenant.id, targetRole: 'student', priority: 'urgent' } }),
      db.notice.create({ data: { title: 'Fee Payment Reminder', content: 'Parents are reminded to pay the pending tuition fees for the second quarter by January 31. Late fees will be applicable after the due date.', authorId: admin.id, tenantId: tenant.id, targetRole: 'parent', priority: 'important' } }),
      db.notice.create({ data: { title: 'New Computer Lab Inauguration', content: 'The new state-of-the-art computer lab with 40 workstations will be inaugurated on March 10. All classes will be allocated time slots.', authorId: admin.id, tenantId: tenant.id, targetRole: 'all', priority: 'normal' } }),
      db.notice.create({ data: { title: 'Annual Day Celebration', content: 'Annual Day will be celebrated on April 5, 2025. Cultural programs, prize distribution, and guest lecture by Dr. A.P.J. Abdul Kalam Memorial Foundation.', authorId: admin.id, tenantId: tenant.id, targetRole: 'all', priority: 'important' } }),
    ]);

    // =========== TIMETABLE ===========
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const timeSlots = [
      { start: '08:00', end: '08:45' },
      { start: '08:45', end: '09:30' },
      { start: '09:45', end: '10:30' },
      { start: '10:30', end: '11:15' },
      { start: '11:30', end: '12:15' },
      { start: '13:00', end: '13:45' },
      { start: '13:45', end: '14:30' },
    ];

    for (const cls of classes) {
      const classSubjects = subjects.filter(s => s.classId === cls.id);
      for (const day of days) {
        for (let i = 0; i < timeSlots.length; i++) {
          const subj = classSubjects[i % classSubjects.length];
          if (subj && subj.teacherId) {
            await db.timetable.create({
              data: {
                classId: cls.id,
                subjectId: subj.id,
                teacherId: subj.teacherId,
                day,
                startTime: timeSlots[i].start,
                endTime: timeSlots[i].end,
              }
            });
          }
        }
      }
    }

    // =========== SUBSCRIPTIONS (with tenantId) ===========
    const subscriptionData = [
      { parentId: parents[0].id, planName: 'Premium', planId: 'premium', amount: 599, period: 'yearly', status: 'active', startDate: '2024-06-15', endDate: '2025-06-15', addons: JSON.stringify(['Live Bus Tracking']) },
      { parentId: parents[1].id, planName: 'Standard', planId: 'standard', amount: 299, period: 'yearly', status: 'active', startDate: '2024-08-01', endDate: '2025-08-01', addons: JSON.stringify([]) },
      { parentId: parents[2].id, planName: 'Premium', planId: 'premium', amount: 599, period: 'yearly', status: 'active', startDate: '2024-07-20', endDate: '2025-07-20', addons: JSON.stringify(['Live Bus Tracking', 'Meal Plan']) },
      { parentId: parents[3].id, planName: 'Standard', planId: 'standard', amount: 299, period: 'yearly', status: 'active', startDate: '2024-09-10', endDate: '2025-09-10', addons: JSON.stringify(['Meal Plan']) },
      { parentId: parents[4].id, planName: 'Basic', planId: 'basic', amount: 0, period: 'yearly', status: 'active', startDate: '2024-04-01', endDate: null, addons: JSON.stringify([]) },
      { parentId: parents[5].id, planName: 'Standard', planId: 'standard', amount: 299, period: 'yearly', status: 'active', startDate: '2024-11-05', endDate: '2025-11-05', addons: JSON.stringify([]) },
      { parentId: parents[6].id, planName: 'Premium', planId: 'premium', amount: 599, period: 'yearly', status: 'cancelled', startDate: '2024-03-01', endDate: '2025-03-01', addons: JSON.stringify([]) },
      { parentId: parents[7].id, planName: 'Basic', planId: 'basic', amount: 0, period: 'yearly', status: 'active', startDate: '2024-04-01', endDate: null, addons: JSON.stringify([]) },
      { parentId: parents[8].id, planName: 'Standard', planId: 'standard', amount: 299, period: 'yearly', status: 'active', startDate: '2024-10-15', endDate: '2025-10-15', addons: JSON.stringify(['Live Bus Tracking']) },
      { parentId: parents[9].id, planName: 'Premium', planId: 'premium', amount: 599, period: 'yearly', status: 'active', startDate: '2024-12-01', endDate: '2025-12-01', addons: JSON.stringify(['Meal Plan']) },
      { parentId: parents[10].id, planName: 'Basic', planId: 'basic', amount: 0, period: 'yearly', status: 'active', startDate: '2024-04-01', endDate: null, addons: JSON.stringify([]) },
      { parentId: parents[11].id, planName: 'Standard', planId: 'standard', amount: 299, period: 'yearly', status: 'cancelled', startDate: '2024-05-20', endDate: '2025-05-20', addons: JSON.stringify([]) },
      // Some historical subscriptions
      { parentId: parents[6].id, planName: 'Standard', planId: 'standard', amount: 299, period: 'yearly', status: 'cancelled', startDate: '2023-03-01', endDate: '2024-03-01', addons: JSON.stringify([]) },
      { parentId: parents[11].id, planName: 'Basic', planId: 'basic', amount: 0, period: 'yearly', status: 'cancelled', startDate: '2023-05-20', endDate: '2024-05-20', addons: JSON.stringify([]) },
    ];

    const subscriptions = await Promise.all(
      subscriptionData.map(s => db.subscription.create({
        data: {
          ...s,
          tenantId: tenant.id,
          paymentMethod: 'card',
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          autoRenew: s.status === 'active',
        }
      }))
    );

    // =========== EVENTS (with tenantId) ===========
    await Promise.all([
      db.event.create({ data: { title: 'Republic Day', description: 'National holiday - Flag hoisting ceremony at 8 AM', date: '2025-01-26', type: 'holiday', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Annual Sports Day', description: 'Inter-house sports competition on the school grounds', date: '2025-03-15', type: 'event', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Mid-Term Exams Begin', description: 'Mid-term examination period for all classes', date: '2025-03-01', type: 'exam', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Science Fair', description: 'Annual science exhibition and project competition', date: '2025-02-28', type: 'event', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Spring Break', description: 'School closed for spring break (Mar 25 - Apr 5)', date: '2025-03-25', type: 'holiday', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Parent-Teacher Meeting', description: 'Quarterly PTM for all classes', date: '2025-02-28', type: 'event', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Annual Day Celebration', description: 'Cultural programs and prize distribution ceremony', date: '2025-04-05', type: 'event', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Independence Day', description: 'National holiday - Flag hoisting and cultural programs', date: '2025-08-15', type: 'holiday', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Teacher\'s Day', description: 'Celebration and honor for all teachers', date: '2025-09-05', type: 'event', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Final Exams Begin', description: 'Final examination period for the academic year', date: '2025-04-15', type: 'exam', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Summer Vacation', description: 'School closes for summer vacation', date: '2025-05-01', type: 'holiday', tenantId: tenant.id } }),
      db.event.create({ data: { title: 'Gandhi Jayanti', description: 'National holiday', date: '2025-10-02', type: 'holiday', tenantId: tenant.id } }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully — Tenant "${tenant.name}" (${tenant.id}), 1 super_admin, 1 admin, 12 teachers, 12 parents, 50 students, 8 classes, 10 notices, 12 events, 14 subscriptions`,
      stats: {
        tenant: 1,
        superAdmin: 1,
        admin: 1,
        teachers: teachers.length,
        parents: parents.length,
        students: students.length,
        classes: classes.length,
        subjects: subjects.length,
        assignments: assignments.length,
        notices: 10,
        events: 12,
        subscriptions: subscriptions.length,
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
