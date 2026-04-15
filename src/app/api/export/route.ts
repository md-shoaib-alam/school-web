import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateApiRequest } from '@/lib/api-auth'

// 🔒 Sanitize CSV cell values to prevent CSV injection (=, +, -, @, |, %)
function sanitizeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Prefix dangerous characters that could trigger formula execution in Excel
  if (/^[=+\-@|%]/.test(str)) {
    return `'${str}`
  }
  // Escape double quotes by doubling them
  return str.replace(/"/g, '""')
}

export async function POST(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error, user, tenantId: sessionTenantId } = await validateApiRequest()
    if (error) return error

    const body = await request.json()
    const { dataType } = body // dataType: 'students' | 'teachers' | 'parents' | 'classes' | 'fees' | 'attendance' | 'notices'

    if (!dataType) {
      return NextResponse.json({ error: 'dataType is required' }, { status: 400 })
    }

    // 🔒 Security: Derive tenantId from session, NOT from request body (prevents IDOR)
    // Super admins can optionally specify a tenantId; others are locked to their own
    let tenantId = sessionTenantId
    if (user?.role === 'super_admin' && body.tenantId) {
      tenantId = body.tenantId
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 403 })
    }

    // Validate tenant exists
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    let csvContent = ''
    let filename = ''

    if (dataType === 'students') {
      const students = await db.student.findMany({
        where: { user: { tenantId } },
        include: { user: { select: { name: true, email: true, role: true, phone: true, isActive: true } }, class: true },
      })
      csvContent = 'Name,Email,Phone,Class,Roll Number,Gender,Date of Birth,Status\n'
      for (const s of students) {
        csvContent += `"${sanitizeCell(s.user.name)}","${sanitizeCell(s.user.email)}","${sanitizeCell(s.user.phone)}","${sanitizeCell(`${s.class.name}-${s.class.section}`)}","${sanitizeCell(s.rollNumber)}","${sanitizeCell(s.gender)}","${sanitizeCell(s.dateOfBirth)}","${s.user.isActive ? 'Active' : 'Inactive'}"\n`
      }
      filename = `${tenant.slug}_students.csv`
    } else if (dataType === 'teachers') {
      const teachers = await db.teacher.findMany({
        where: { user: { tenantId } },
        include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
      })
      csvContent = 'Name,Email,Phone,Qualification,Experience,Status\n'
      for (const t of teachers) {
        csvContent += `"${sanitizeCell(t.user.name)}","${sanitizeCell(t.user.email)}","${sanitizeCell(t.user.phone)}","${sanitizeCell(t.qualification)}","${sanitizeCell(t.experience)}","${t.user.isActive ? 'Active' : 'Inactive'}"\n`
      }
      filename = `${tenant.slug}_teachers.csv`
    } else if (dataType === 'parents') {
      const parents = await db.parent.findMany({
        where: { user: { tenantId } },
        include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
      })
      csvContent = 'Name,Email,Phone,Occupation,Status\n'
      for (const p of parents) {
        csvContent += `"${sanitizeCell(p.user.name)}","${sanitizeCell(p.user.email)}","${sanitizeCell(p.user.phone)}","${sanitizeCell(p.occupation)}","${p.user.isActive ? 'Active' : 'Inactive'}"\n`
      }
      filename = `${tenant.slug}_parents.csv`
    } else if (dataType === 'classes') {
      const classes = await db.class.findMany({ where: { tenantId } })
      csvContent = 'Name,Section,Grade,Capacity\n'
      for (const c of classes) {
        csvContent += `"${sanitizeCell(c.name)}","${sanitizeCell(c.section)}","${sanitizeCell(c.grade)}","${c.capacity}"\n`
      }
      filename = `${tenant.slug}_classes.csv`
    } else if (dataType === 'fees') {
      const students = await db.student.findMany({
        where: { user: { tenantId } },
        include: { user: { select: { name: true } }, fees: true },
      })
      csvContent = 'Student Name,Fee Type,Amount,Status,Due Date,Paid Amount\n'
      for (const s of students) {
        for (const f of s.fees) {
          csvContent += `"${sanitizeCell(s.user.name)}","${sanitizeCell(f.type)}","${f.amount}","${sanitizeCell(f.status)}","${sanitizeCell(f.dueDate)}","${f.paidAmount}"\n`
        }
      }
      filename = `${tenant.slug}_fees.csv`
    } else if (dataType === 'attendance') {
      const classes = await db.class.findMany({ where: { tenantId } })
      const classIds = classes.map(c => c.id)
      const records = await db.attendance.findMany({
        where: { classId: { in: classIds } },
        include: { student: { include: { user: { select: { name: true } } } } },
        take: 5000,
        orderBy: { date: 'desc' },
      })
      csvContent = 'Student Name,Date,Status\n'
      for (const r of records) {
        csvContent += `"${sanitizeCell(r.student.user.name)}","${sanitizeCell(r.date)}","${sanitizeCell(r.status)}"\n`
      }
      filename = `${tenant.slug}_attendance.csv`
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
