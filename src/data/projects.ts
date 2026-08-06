export interface ArchitectureLayer {
  /** Layer name, e.g. "Web Client" or "REST API". */
  layer: string
  /** Technologies powering this layer. */
  tech: string
}

export interface SchemaColumn {
  name: string
  type: string
  key?: 'PK' | 'FK' | 'UQ'
}

export interface SchemaTable {
  table: string
  columns: SchemaColumn[]
}

export interface Project {
  id: string
  title: { en: string; id: string }
  category: string
  year: string
  desc: { en: string; id: string }
  features: { en: string[]; id: string[] }
  stack: string[]
  /** Layered system architecture shown in the project drawer. */
  architecture: ArchitectureLayer[]
  /** Database tables shown in the project drawer. */
  schema: SchemaTable[]
  /** Two accent hex colors for this project. */
  theme: [string, string]
  github: string
  /** Empty string hides the Live Demo button. TODO: add real URLs. */
  demo: string
}

export const projects: Project[] = [
  {
    id: 'scholarship',
    title: {
      en: 'Non-APBN Scholarship Information System — UNAND',
      id: 'Sistem Informasi Beasiswa Non-APBN UNAND',
    },
    category: 'Web · Information System',
    year: '2025 – 2026',
    desc: {
      en: 'Digitalization of the Non-APBN scholarship flow at Universitas Andalas — structured registration, administration, document validation and selection processes.',
      id: 'Digitalisasi alur beasiswa Non-APBN di Universitas Andalas — pendaftaran, administrasi, validasi dokumen, dan seleksi yang terstruktur.',
    },
    features: {
      en: ['Online application portal', 'Document validation workflow', 'Structured selection process', 'Admin dashboard'],
      id: ['Portal pendaftaran daring', 'Alur validasi dokumen', 'Proses seleksi terstruktur', 'Dashboard admin'],
    },
    stack: ['React.js', 'Vite', 'Tailwind CSS', 'Ant Design', 'Node.js', 'Express.js', 'MySQL', 'Sequelize ORM', 'Redis'],
    architecture: [
      { layer: 'Web Client', tech: 'React.js · Vite · Tailwind · Ant Design' },
      { layer: 'REST API', tech: 'Node.js · Express.js · Sequelize ORM' },
      { layer: 'Cache Layer', tech: 'Redis' },
      { layer: 'Database', tech: 'MySQL' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
          { name: 'password_hash', type: 'VARCHAR(255)' },
          { name: 'role', type: 'ENUM(admin, student, reviewer)' },
        ],
      },
      {
        table: 'applications',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'user_id', type: 'INT', key: 'FK' },
          { name: 'status', type: 'ENUM(draft, submitted, verified, selected)' },
          { name: 'submitted_at', type: 'DATETIME' },
        ],
      },
      {
        table: 'documents',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'application_id', type: 'INT', key: 'FK' },
          { name: 'type', type: 'VARCHAR(50)' },
          { name: 'file_path', type: 'VARCHAR(255)' },
        ],
      },
    ],
    theme: ['#2563eb', '#22d3ee'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'pkm',
    title: {
      en: 'Student Creativity Program (PKM) Web — UNAND',
      id: 'Web Program Kreativitas Mahasiswa (PKM) UNAND',
    },
    category: 'Web · Multi-Role System',
    year: '2025 – 2026',
    desc: {
      en: 'A PKM proposal management system with multi-role authentication for Superadmin, Reviewer, Supervising Lecturer, Student and Leadership.',
      id: 'Sistem manajemen proposal PKM dengan autentikasi multi-role untuk Superadmin, Reviewer, Dosen Pendamping, Mahasiswa, dan Pimpinan.',
    },
    features: {
      en: ['Multi-role authentication', 'Proposal submission & review', 'Supervision workflow', 'Leadership reporting'],
      id: ['Autentikasi multi-role', 'Pengajuan & review proposal', 'Alur pendampingan', 'Laporan untuk pimpinan'],
    },
    stack: ['Laravel', 'MVC', 'MySQL'],
    architecture: [
      { layer: 'Browser', tech: 'Laravel Blade · Tailwind' },
      { layer: 'Controller Layer', tech: 'Laravel (MVC)' },
      { layer: 'Middleware', tech: 'Multi-Role Authentication' },
      { layer: 'Database', tech: 'MySQL · Eloquent ORM' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
          { name: 'role', type: 'ENUM(superadmin, reviewer, lecturer, student, leadership)' },
        ],
      },
      {
        table: 'proposals',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'author_id', type: 'INT', key: 'FK' },
          { name: 'title', type: 'VARCHAR(200)' },
          { name: 'status', type: 'ENUM(draft, submitted, under_review, approved, revised)' },
        ],
      },
      {
        table: 'reviews',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'proposal_id', type: 'INT', key: 'FK' },
          { name: 'reviewer_id', type: 'INT', key: 'FK' },
          { name: 'score', type: 'TINYINT' },
          { name: 'note', type: 'TEXT' },
        ],
      },
    ],
    theme: ['#4f46e5', '#818cf8'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'simsapras',
    title: { en: 'SIMSAPRAS UNAND', id: 'SIMSAPRAS UNAND' },
    category: 'Web · Administration',
    year: '2024 – 2025',
    desc: {
      en: 'Reservation and management system for campus facility and asset loaning at Universitas Andalas.',
      id: 'Sistem reservasi dan pengelolaan peminjaman fasilitas dan aset kampus Universitas Andalas.',
    },
    features: {
      en: ['Facility booking & scheduling', 'Asset loaning records', 'Approval chains', 'Accurate usage data'],
      id: ['Pemesanan & jadwal fasilitas', 'Catatan peminjaman aset', 'Alur persetujuan', 'Data penggunaan akurat'],
    },
    stack: ['Laravel', 'MVC', 'MySQL'],
    architecture: [
      { layer: 'Browser', tech: 'Laravel (MVC)' },
      { layer: 'Controller Layer', tech: 'Reservations · Approvals' },
      { layer: 'Database', tech: 'MySQL · Eloquent ORM' },
    ],
    schema: [
      {
        table: 'facilities',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(140)' },
          { name: 'location', type: 'VARCHAR(180)' },
          { name: 'status', type: 'ENUM(available, borrowed, maintenance)' },
        ],
      },
      {
        table: 'bookings',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'user_id', type: 'INT', key: 'FK' },
          { name: 'facility_id', type: 'INT', key: 'FK' },
          { name: 'start_at', type: 'DATETIME' },
          { name: 'end_at', type: 'DATETIME' },
          { name: 'status', type: 'ENUM(pending, approved, rejected, returned)' },
        ],
      },
      {
        table: 'approvals',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'booking_id', type: 'INT', key: 'FK' },
          { name: 'approver_id', type: 'INT', key: 'FK' },
          { name: 'decision', type: 'ENUM(approved, rejected)' },
          { name: 'decided_at', type: 'DATETIME' },
        ],
      },
    ],
    theme: ['#1d4ed8', '#38bdf8'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'dpmptsp-web',
    title: {
      en: 'DPMPTSP Padang Profile & Visitor Management Web',
      id: 'Web Profil & Visitor Management DPMPTSP Padang',
    },
    category: 'Web · Public Service',
    year: '2025',
    desc: {
      en: 'Public service profile platform plus a visitor registration and reception management system, built with Laravel and MySQL.',
      id: 'Platform profil layanan publik serta sistem pendaftaran dan penerimaan tamu kunjungan, dibangun dengan Laravel dan MySQL.',
    },
    features: {
      en: ['Public service profile pages', 'Visitor registration', 'Visit reception management', 'Responsive design'],
      id: ['Halaman profil layanan', 'Registrasi tamu', 'Manajemen penerimaan kunjungan', 'Desain responsif'],
    },
    stack: ['Laravel', 'MySQL', 'Tailwind CSS'],
    architecture: [
      { layer: 'Browser', tech: 'Laravel Blade' },
      { layer: 'Controller Layer', tech: 'Laravel (MVC)' },
      { layer: 'Database', tech: 'MySQL' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
          { name: 'role', type: 'ENUM(admin, officer)' },
        ],
      },
      {
        table: 'visitors',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'phone', type: 'VARCHAR(20)' },
          { name: 'institution', type: 'VARCHAR(140)' },
          { name: 'visited_at', type: 'DATETIME' },
        ],
      },
      {
        table: 'visits',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'visitor_id', type: 'INT', key: 'FK' },
          { name: 'officer_id', type: 'INT', key: 'FK' },
          { name: 'purpose', type: 'VARCHAR(180)' },
          { name: 'status', type: 'ENUM(scheduled, done, cancelled)' },
        ],
      },
    ],
    theme: ['#0ea5e9', '#6366f1'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'excamotion',
    title: { en: 'ExcaMotion Android App', id: 'ExcaMotion Android App' },
    category: 'Android · Utility · Play Store',
    year: '2025',
    desc: {
      en: 'Real-time analysis of excavator operational cycle duration (Dig, Load, Swing, Dump). Published on the Google Play Store.',
      id: 'Analisis real-time durasi siklus kerja operasional ekskavator (Dig, Load, Swing, Dump). Dipublikasikan di Google Play Store.',
    },
    features: {
      en: ['Real-time cycle analysis', 'Dig / Load / Swing / Dump tracking', 'Local data with Room', 'Published on Google Play'],
      id: ['Analisis siklus real-time', 'Pelacakan Dig / Load / Swing / Dump', 'Data lokal dengan Room', 'Tersedia di Google Play'],
    },
    stack: ['Kotlin', 'Jetpack Compose', 'Room Database'],
    architecture: [
      { layer: 'UI', tech: 'Jetpack Compose · Material 3' },
      { layer: 'ViewModel', tech: 'MVVM · Coroutines' },
      { layer: 'Repository', tech: 'Room Database' },
      { layer: 'Local DB', tech: 'SQLite' },
    ],
    schema: [
      {
        table: 'cycles',
        columns: [
          { name: 'id', type: 'INTEGER', key: 'PK' },
          { name: 'equipment_id', type: 'TEXT' },
          { name: 'started_at', type: 'TIMESTAMP' },
          { name: 'ended_at', type: 'TIMESTAMP' },
          { name: 'duration_ms', type: 'INTEGER' },
        ],
      },
      {
        table: 'cycle_phases',
        columns: [
          { name: 'id', type: 'INTEGER', key: 'PK' },
          { name: 'cycle_id', type: 'INTEGER', key: 'FK' },
          { name: 'phase', type: 'ENUM(dig, load, swing, dump)' },
          { name: 'duration_ms', type: 'INTEGER' },
          { name: 'started_at', type: 'TIMESTAMP' },
        ],
      },
    ],
    theme: ['#dc2626', '#f97316'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'telemetri',
    title: { en: 'TeleMetri Multi-Platform App', id: 'TeleMetri Multi-Platform App' },
    category: 'Mobile · Flutter',
    year: '2025',
    desc: {
      en: 'Organization attendance app using QR Code integration and geofencing/GPS mapping of the secretariat location.',
      id: 'Aplikasi absensi organisasi menggunakan integrasi QR Code dan pemetaan geofencing/GPS lokasi sekretariat.',
    },
    features: {
      en: ['QR Code check-in', 'Geofencing / GPS validation', 'Cross-platform (Android & iOS)', 'Attendance history'],
      id: ['Check-in QR Code', 'Validasi geofencing / GPS', 'Lintas platform (Android & iOS)', 'Riwayat absensi'],
    },
    stack: ['Flutter', 'Laravel', 'REST API'],
    architecture: [
      { layer: 'Mobile App', tech: 'Flutter (Android & iOS)' },
      { layer: 'Location Service', tech: 'Geofencing · GPS' },
      { layer: 'REST API', tech: 'Laravel' },
      { layer: 'Database', tech: 'MySQL' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
          { name: 'phone', type: 'VARCHAR(20)' },
        ],
      },
      {
        table: 'secretariat_locations',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'latitude', type: 'DECIMAL(10,7)' },
          { name: 'longitude', type: 'DECIMAL(10,7)' },
          { name: 'radius_m', type: 'INT' },
        ],
      },
      {
        table: 'attendances',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'user_id', type: 'INT', key: 'FK' },
          { name: 'location_id', type: 'INT', key: 'FK' },
          { name: 'method', type: 'ENUM(qr, gps)' },
          { name: 'checked_in_at', type: 'DATETIME' },
        ],
      },
    ],
    theme: ['#0891b2', '#22d3ee'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'whistleblowing',
    title: { en: 'Whistleblowing System DPMPTSP Padang', id: 'Whistleblowing System DPMPTSP Padang' },
    category: 'Android · Kotlin',
    year: '2025',
    desc: {
      en: 'Android application for digital, integrated internal complaint reporting within a government agency.',
      id: 'Aplikasi Android pelaporan pengaduan internal instansi pemerintah secara digital dan terintegrasi.',
    },
    features: {
      en: ['Complaint submission with media', 'Case status tracking', 'Node.js REST API integration', 'Material 3 UI'],
      id: ['Pengajuan pengaduan dengan media', 'Pelacakan status kasus', 'Integrasi REST API Node.js', 'UI Material 3'],
    },
    stack: ['Kotlin', 'Jetpack Compose', 'Node.js', 'REST API'],
    architecture: [
      { layer: 'UI', tech: 'Jetpack Compose · Material 3' },
      { layer: 'REST API', tech: 'Node.js · Express.js' },
      { layer: 'Database', tech: 'MySQL' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'role', type: 'ENUM(public, officer, admin)' },
        ],
      },
      {
        table: 'reports',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'user_id', type: 'INT', key: 'FK' },
          { name: 'category', type: 'VARCHAR(60)' },
          { name: 'description', type: 'TEXT' },
          { name: 'media_path', type: 'VARCHAR(255)' },
          { name: 'status', type: 'ENUM(open, in_progress, resolved)' },
          { name: 'created_at', type: 'DATETIME' },
        ],
      },
      {
        table: 'report_statuses',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'report_id', type: 'INT', key: 'FK' },
          { name: 'status', type: 'VARCHAR(30)' },
          { name: 'note', type: 'TEXT' },
          { name: 'updated_at', type: 'DATETIME' },
        ],
      },
    ],
    theme: ['#7c3aed', '#a78bfa'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'bersama-rakyat',
    title: { en: 'Bersama Rakyat & AgroWista Android Apps', id: 'Bersama Rakyat & AgroWista Android Apps' },
    category: 'Android · Civic & Tourism',
    year: '2024',
    desc: {
      en: 'A public political promise transparency app and a village tourism platform for reviewing and reporting environmental conditions.',
      id: 'Aplikasi transparansi pemantauan janji politik publik serta platform ulasan dan pelaporan kondisi lingkungan desa wisata.',
    },
    features: {
      en: ['Political promise tracking', 'Village tourism reviews', 'Environment condition reports', 'MVVM architecture'],
      id: ['Pelacakan janji politik', 'Ulasan wisata desa', 'Laporan kondisi lingkungan', 'Arsitektur MVVM'],
    },
    stack: ['Kotlin', 'Jetpack Compose', 'MVVM', 'Node.js API'],
    architecture: [
      { layer: 'UI', tech: 'Jetpack Compose' },
      { layer: 'ViewModel', tech: 'MVVM' },
      { layer: 'REST API', tech: 'Node.js' },
      { layer: 'Local Cache', tech: 'Room' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
        ],
      },
      {
        table: 'promises',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'politician_id', type: 'INT', key: 'FK' },
          { name: 'title', type: 'VARCHAR(180)' },
          { name: 'status', type: 'ENUM(kept, in_progress, broken)' },
          { name: 'updated_at', type: 'DATETIME' },
        ],
      },
      {
        table: 'reports',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'user_id', type: 'INT', key: 'FK' },
          { name: 'location', type: 'VARCHAR(180)' },
          { name: 'description', type: 'TEXT' },
          { name: 'image_path', type: 'VARCHAR(255)' },
          { name: 'created_at', type: 'DATETIME' },
        ],
      },
    ],
    theme: ['#0f766e', '#2dd4bf'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
]
