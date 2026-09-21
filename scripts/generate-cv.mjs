/**
 * Generates a minimal, valid PDF resume at public/cv.pdf.
 * Run with: node scripts/generate-cv.mjs
 * Edit the content below to match the real resume, then re-run.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const SECTIONS = [
  {
    title: 'EDUCATION',
    lines: [
      'S1 Information Systems - Universitas Andalas',
      'GPA 3.77 / 4.00 - Expected graduation: September 2026',
    ],
  },
  {
    title: 'TECH STACK',
    lines: [
      'Languages: Kotlin, Dart, JavaScript, PHP',
      'Mobile: Android SDK, Jetpack Compose, Flutter, XML Layout, Coroutines, Room Database',
      'Web Frontend: React.js, Vite, Tailwind CSS, Ant Design, HTML5, CSS3',
      'Web Backend: Laravel (PHP), Node.js, Express.js, RESTful API, Sequelize ORM',
      'Database & Caching: MySQL, PostgreSQL, SQLite, Redis',
      'Tools & DevOps: Git, GitHub, Postman, Linux (Ubuntu), Docker, Containerization',
      'Architecture: MVC, MVVM, Clean Architecture, Multi-Role Authentication',
    ],
  },
  {
    title: 'EXPERIENCE',
    lines: [
      'Junior Programmer (Intern) - IT Directorate, Universitas Andalas (2026 - Present)',
      'IT Support Intern - Dinas PMPTSP Kota Padang (2025)',
      'Head of Household Division - IT Governance Lab UNAND (2025)',
      'Public Relations Member - Basic Computing Lab UNAND (2024 - 2025)',
    ],
  },
  {
    title: 'FEATURED PROJECTS',
    lines: [
      'Non-APBN Scholarship Information System UNAND (React, Express, MySQL, Redis)',
      'PKM Proposal Management Web UNAND (Laravel, Multi-Role Auth)',
      'SIMSAPRAS - Facility & Asset Reservation System (Laravel, MySQL)',
      'DPMPTSP Padang Profile & Visitor Management (Laravel, MySQL)',
      'ExcaMotion Android App - Play Store (Kotlin, Jetpack Compose, Room)',
      'TeleMetri Multi-Platform App (Flutter, Laravel REST API, QR/Geofencing)',
      'Whistleblowing System DPMPTSP (Kotlin, Compose, Node.js API)',
      'Bersama Rakyat & AgroWista Android Apps (Kotlin, Compose, MVVM)',
    ],
  },
  {
    title: 'ACHIEVEMENTS',
    lines: [
      'Alumni - Bangkit Academy 2024 (Google, Tokopedia, Gojek, Traveloka)',
      '2nd Place - Impact National Hackathon by Maxy Academy (Dec 2024)',
      '3rd Place - National Cybertech Hackathon, Politeknik Negeri Padang (Dec 2024)',
      'Leadership - UKM Neo Telemetri UNAND (OC Coordinator, PIC Firetech 2025)',
    ],
  },
]

function escapeText(s) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

const objects = []
let stream = ''

stream += '0.13 0.39 0.92 rg\n'
stream += 'BT /F2 22 Tf 56 748 Td (KHALIED NAULY MATURINO) Tj ET\n'
stream += '0.13 0.39 0.92 rg\nBT /F2 12 Tf 56 730 Td (Software Developer - Mobile & Web) Tj ET\n'
stream +=
  '0.58 0.64 0.72 rg\nBT /F1 9 Tf 56 716 Td (Padang, Indonesia  |  khalidmaturino@gmail.com  |  github.com/paybackretr0) Tj ET\n'

let y = 700
for (const section of SECTIONS) {
  stream += `0.13 0.39 0.92 rg\nBT /F2 12 Tf 56 ${y} Td (${escapeText(section.title)}) Tj ET\n`
  y -= 17
  stream += '0.86 0.9 0.93 RG 0.8 w\n56 ' + (y + 4) + ' m 540 ' + (y + 4) + ' l S\n'
  y -= 15
  for (const line of section.lines) {
    stream += `0.15 0.16 0.2 rg\nBT /F1 10 Tf 56 ${y} Td (${escapeText(line)}) Tj ET\n`
    y -= 13
  }
  y -= 14
}

objects.push('<< /Type /Catalog /Pages 2 0 R >>')
objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
objects.push(
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
)
objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`)

let pdf = '%PDF-1.4\n'
const offsets = [0]
objects.forEach((body, i) => {
  offsets.push(Buffer.byteLength(pdf, 'utf8'))
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
})
const xrefStart = Buffer.byteLength(pdf, 'utf8')
pdf += `xref\n0 ${objects.length + 1}\n`
pdf += '0000000000 65535 f \n'
for (let i = 1; i <= objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(join(root, 'public', 'cv.pdf'), pdf, 'utf8')
console.log('✓ public/cv.pdf generated')
