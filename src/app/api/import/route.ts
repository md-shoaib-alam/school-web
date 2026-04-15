import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateApiRequest } from '@/lib/api-auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // 🔒 Security: Require authentication
    const { error, user, tenantId: sessionTenantId } = await validateApiRequest()
    if (error) return error

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const dataType = formData.get('dataType') as string | null

    if (!file || !dataType) {
      return NextResponse.json({ error: 'file and dataType are required' }, { status: 400 })
    }

    // 🔒 Security: Derive tenantId from session, NOT from request body (prevents IDOR)
    // Super admins can optionally specify a tenantId; others are locked to their own
    let tenantId = sessionTenantId
    const requestTenantId = formData.get('tenantId') as string | null
    if (user?.role === 'super_admin' && requestTenantId) {
      tenantId = requestTenantId
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 403 })
    }

    // Validate tenant
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or has no data rows' }, { status: 400 })
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())
    const rows = lines.slice(1).map(line => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; continue }
        if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue }
        current += char
      }
      values.push(current.trim())
      return values
    })

    let imported = 0
    let errors = 0

    // 🔒 Hash a default password for imported users
    const defaultHashedPassword = await bcrypt.hash('changeme123', 12)

    if (dataType === 'students') {
      // Create users + students
      for (const row of rows) {
        if (row.length < 3) { errors++; continue }
        const name = row[0] || ''
        const email = row[1] || ''
        if (!name || !email) { errors++; continue }

        try {
          // Check if user already exists
          const existing = await db.user.findUnique({ where: { email } })
          if (existing) { errors++; continue }

          const user = await db.user.create({
            data: {
              email, name,
              role: 'student',
              phone: row[2] || null,
              tenantId,
              isActive: true,
              password: defaultHashedPassword,
            },
          })

          // Find class by name (from row[3])
          const className = row[3] || ''
          let classId = ''
          if (className) {
            const parts = className.split('-')
            const cls = await db.class.findFirst({
              where: { tenantId, name: parts[0], section: parts[1] || 'A' },
            })
            if (cls) classId = cls.id
          }

          if (classId) {
            await db.student.create({
              data: {
                userId: user.id,
                classId,
                rollNumber: row[4] || `R${imported + 1}`,
                gender: row[5] || 'male',
                dateOfBirth: row[6] || null,
              },
            });
            imported++;
          } else {
            // Skip students without a matching class (classId is required)
            errors++;
            continue;
          }
        } catch { errors++ }
      }
    } else if (dataType === 'teachers') {
      for (const row of rows) {
        if (row.length < 2) { errors++; continue }
        const name = row[0] || ''
        const email = row[1] || ''
        if (!name || !email) { errors++; continue }

        try {
          const existing = await db.user.findUnique({ where: { email } })
          if (existing) { errors++; continue }

          const user = await db.user.create({
            data: {
              email, name,
              role: 'teacher',
              phone: row[2] || null,
              tenantId,
              isActive: true,
              password: defaultHashedPassword,
            },
          })

          await db.teacher.create({
            data: {
              userId: user.id,
              qualification: row[3] || null,
              experience: row[4] || null,
            },
          })
          imported++
        } catch { errors++ }
      }
    } else if (dataType === 'parents') {
      for (const row of rows) {
        if (row.length < 2) { errors++; continue }
        const name = row[0] || ''
        const email = row[1] || ''
        if (!name || !email) { errors++; continue }

        try {
          const existing = await db.user.findUnique({ where: { email } })
          if (existing) { errors++; continue }

          const user = await db.user.create({
            data: {
              email, name,
              role: 'parent',
              phone: row[2] || null,
              tenantId,
              isActive: true,
              password: defaultHashedPassword,
            },
          })

          await db.parent.create({
            data: {
              userId: user.id,
              occupation: row[3] || null,
            },
          })
          imported++
        } catch { errors++ }
      }
    } else if (dataType === 'classes') {
      for (const row of rows) {
        if (row.length < 2) { errors++; continue }
        const name = row[0] || ''
        const section = row[1] || 'A'
        if (!name) { errors++; continue }

        try {
          await db.class.create({
            data: {
              tenantId,
              name,
              section,
              grade: row[2] || name,
              capacity: parseInt(row[3]) || 40,
            },
          })
          imported++
        } catch { errors++ }
      }
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'BULK_IMPORT',
        resource: dataType,
        details: JSON.stringify({ tenantId, dataType, imported, errors, total: rows.length }),
      },
    })

    return NextResponse.json({
      success: true,
      imported,
      errors,
      total: rows.length,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
