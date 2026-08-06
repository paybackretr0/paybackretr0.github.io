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
  /** The role played on this project, e.g. "Full-Stack Developer". */
  role: string
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
    id: 'bss',
    title: {
      en: 'Student Temporary Leave (BSS) Management System — UNAND',
      id: 'Sistem Manajemen Berhenti Studi Sementara (BSS) UNAND',
    },
    role: 'Junior Programmer (Intern)',
    category: 'Web · Information System',
    year: '2026',
    desc: {
      en: 'Web-based system digitalizing the student temporary leave (BSS) flow at Universitas Andalas — online submission, verification by authorized officials, official confirmation letter issuance and administrative data management.',
      id: 'Sistem berbasis web untuk mendigitalisasi alur Berhenti Studi Sementara (BSS) mahasiswa Universitas Andalas — pengajuan daring, verifikasi oleh pejabat berwenang, penerbitan surat konfirmasi resmi, dan manajemen data administrasi.',
    },
    features: {
      en: [
        'Online leave application',
        'Multi-step verification workflow',
        'Official confirmation letter issuance',
        'Administrative data management',
      ],
      id: [
        'Pengajuan cuti daring',
        'Alur verifikasi bertingkat',
        'Penerbitan surat konfirmasi resmi',
        'Manajemen data administrasi',
      ],
    },
    stack: ['PHP', 'Laravel', 'MySQL', 'Docker', 'Bootstrap'],
    architecture: [
      { layer: 'Browser', tech: 'Laravel Blade · Bootstrap' },
      { layer: 'Controller Layer', tech: 'Laravel (MVC)' },
      { layer: 'Middleware', tech: 'Multi-Role Verification' },
      { layer: 'Database', tech: 'MySQL · Eloquent ORM' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
          { name: 'role', type: 'ENUM(admin, student, officer)' },
        ],
      },
      {
        table: 'applications',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'student_id', type: 'INT', key: 'FK' },
          { name: 'reason', type: 'TEXT' },
          { name: 'status', type: 'ENUM(submitted, verified, approved, rejected)' },
          { name: 'submitted_at', type: 'DATETIME' },
        ],
      },
      {
        table: 'letters',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'application_id', type: 'INT', key: 'FK' },
          { name: 'letter_number', type: 'VARCHAR(60)' },
          { name: 'issued_at', type: 'DATETIME' },
        ],
      },
    ],
    theme: ['#059669', '#34d399'],
    github: 'https://github.com/paybackretr0',
    demo: 'https://sso.unand.ac.id',
  },
  {
    id: 'scholarship',
    title: {
      en: 'Non-APBN Scholarship Information System — UNAND',
      id: 'Sistem Informasi Beasiswa Non-APBN UNAND',
    },
    role: 'Full-Stack Developer',
    category: 'Web · Information System',
    year: '2025 – 2026',
    desc: {
      en: 'Digitalization of the Non-APBN scholarship flow at Universitas Andalas — structured registration, administration, document validation and selection processes.',
      id: 'Digitalisasi alur beasiswa Non-APBN di Universitas Andalas — pendaftaran, administrasi, validasi dokumen, dan seleksi yang terstruktur.',
    },
    features: {
      en: [
        'Online application portal',
        'Document validation workflow',
        'Structured selection process',
        'Admin dashboard',
      ],
      id: [
        'Portal pendaftaran daring',
        'Alur validasi dokumen',
        'Proses seleksi terstruktur',
        'Dashboard admin',
      ],
    },
    stack: [
      'React.js',
      'Vite',
      'Tailwind CSS',
      'Ant Design',
      'Node.js',
      'Express.js',
      'Sequelize ORM',
      'Redis',
      'MySQL',
      'Docker',
    ],
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
    role: 'Web Developer',
    category: 'Web · Multi-Role System',
    year: '2025 – 2026',
    desc: {
      en: 'A PKM proposal management system with multi-role authentication for Superadmin, Reviewer, Supervising Lecturer, Student and Leadership.',
      id: 'Sistem manajemen proposal PKM dengan autentikasi multi-role untuk Superadmin, Reviewer, Dosen Pendamping, Mahasiswa, dan Pimpinan.',
    },
    features: {
      en: [
        'Multi-role authentication',
        'Proposal submission & review',
        'Supervision workflow',
        'Leadership reporting',
      ],
      id: [
        'Autentikasi multi-role',
        'Pengajuan & review proposal',
        'Alur pendampingan',
        'Laporan untuk pimpinan',
      ],
    },
    stack: ['PHP', 'Laravel', 'MySQL', 'Docker', 'Tailwind CSS'],
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
    demo: 'https://pkm.unand.ac.id',
  },
  {
    id: 'telemetri-admin',
    title: { en: 'TeleMetri Admin Dashboard', id: 'Dashboard Admin TeleMetri' },
    role: 'Full-Stack Developer',
    category: 'Web · Admin Portal',
    year: '2025',
    desc: {
      en: 'Web admin dashboard controlling the Neo Telemetri organization attendance system — membership management, picket scheduling, dynamic QR Code generation for attendance and activity monitoring.',
      id: 'Dashboard admin web untuk mengontrol sistem absensi organisasi Neo Telemetri — manajemen keanggotaan, penjadwalan piket, pembuatan QR Code presensi dinamis, dan pemantauan kegiatan.',
    },
    features: {
      en: [
        'Membership management',
        'Picket scheduling',
        'Dynamic QR Code attendance',
        'Activity monitoring',
      ],
      id: [
        'Manajemen keanggotaan',
        'Penjadwalan piket',
        'QR Code presensi dinamis',
        'Pemantauan kegiatan',
      ],
    },
    stack: ['PHP', 'Laravel', 'MySQL', 'Docker', 'Tailwind CSS'],
    architecture: [
      { layer: 'Browser', tech: 'Laravel Blade · Tailwind' },
      { layer: 'Controller Layer', tech: 'Laravel (MVC)' },
      { layer: 'QR Service', tech: 'Dynamic QR Generation' },
      { layer: 'Database', tech: 'MySQL · Eloquent ORM' },
    ],
    schema: [
      {
        table: 'members',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
          { name: 'division', type: 'VARCHAR(60)' },
        ],
      },
      {
        table: 'schedules',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'member_id', type: 'INT', key: 'FK' },
          { name: 'shift', type: 'VARCHAR(40)' },
          { name: 'start_at', type: 'DATETIME' },
          { name: 'end_at', type: 'DATETIME' },
        ],
      },
      {
        table: 'qr_attendances',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'schedule_id', type: 'INT', key: 'FK' },
          { name: 'qr_token', type: 'VARCHAR(255)' },
          { name: 'scanned_at', type: 'DATETIME' },
          { name: 'status', type: 'ENUM(present, late, absent)' },
        ],
      },
    ],
    theme: ['#0e7490', '#5eead4'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'aceed-expo',
    title: { en: 'Unand Job Fair 2025 — ACEED EXPO', id: 'Unand Job Fair 2025 — ACEED EXPO' },
    role: 'Web Developer · Data & IT Coordinator',
    category: 'Web · Event Management',
    year: '2025',
    desc: {
      en: 'Integrated web platform powering the large-scale ACEED EXPO Unand 2025 recruitment event — participant/alumni registration, job vacancy publication by partner companies and event schedule management.',
      id: 'Platform web terpadu untuk mendukung acara rekrutmen skala besar ACEED EXPO Unand 2025 — pendaftaran peserta/alumni, publikasi lowongan kerja perusahaan mitra, dan manajemen jadwal acara.',
    },
    features: {
      en: [
        'Participant & alumni registration',
        'Job vacancy publication',
        'Partner company accounts',
        'Event schedule management',
      ],
      id: [
        'Pendaftaran peserta & alumni',
        'Publikasi lowongan kerja',
        'Akun perusahaan mitra',
        'Manajemen jadwal acara',
      ],
    },
    stack: ['PHP', 'Laravel', 'MySQL', 'Docker', 'Tailwind CSS'],
    architecture: [
      { layer: 'Browser', tech: 'Laravel Blade · Tailwind' },
      { layer: 'Controller Layer', tech: 'Laravel (MVC)' },
      { layer: 'Middleware', tech: 'Participant · Company · Admin' },
      { layer: 'Database', tech: 'MySQL · Eloquent ORM' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
          { name: 'role', type: 'ENUM(participant, company, admin)' },
        ],
      },
      {
        table: 'job_vacancies',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'company_id', type: 'INT', key: 'FK' },
          { name: 'title', type: 'VARCHAR(180)' },
          { name: 'description', type: 'TEXT' },
          { name: 'deadline', type: 'DATE' },
        ],
      },
      {
        table: 'registrations',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'user_id', type: 'INT', key: 'FK' },
          { name: 'event_id', type: 'INT', key: 'FK' },
          { name: 'status', type: 'ENUM(registered, attended, absent)' },
          { name: 'registered_at', type: 'DATETIME' },
        ],
      },
    ],
    theme: ['#d97706', '#fbbf24'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'telemetri',
    title: { en: 'TeleMetri Multi-Platform App', id: 'TeleMetri Multi-Platform App' },
    role: 'Mobile Application Developer',
    category: 'Mobile · Flutter',
    year: '2025',
    desc: {
      en: 'Organization attendance app using QR Code integration and geofencing/GPS mapping of the secretariat location.',
      id: 'Aplikasi absensi organisasi menggunakan integrasi QR Code dan pemetaan geofencing/GPS lokasi sekretariat.',
    },
    features: {
      en: [
        'QR Code check-in',
        'Geofencing / GPS validation',
        'Cross-platform (Android & iOS)',
        'Attendance history',
      ],
      id: [
        'Check-in QR Code',
        'Validasi geofencing / GPS',
        'Lintas platform (Android & iOS)',
        'Riwayat absensi',
      ],
    },
    stack: ['Flutter', 'Laravel', 'MySQL', 'REST API'],
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
    id: 'excamotion',
    title: { en: 'ExcaMotion Android App', id: 'ExcaMotion Android App' },
    role: 'Android Developer',
    category: 'Android · Utility · Play Store',
    year: '2025',
    desc: {
      en: 'Real-time analysis of excavator operational cycle duration (Dig, Load, Swing, Dump). Published on the Google Play Store.',
      id: 'Analisis real-time durasi siklus kerja operasional ekskavator (Dig, Load, Swing, Dump). Dipublikasikan di Google Play Store.',
    },
    features: {
      en: [
        'Real-time cycle analysis',
        'Dig / Load / Swing / Dump tracking',
        'Local data with Room',
        'Published on Google Play',
      ],
      id: [
        'Analisis siklus real-time',
        'Pelacakan Dig / Load / Swing / Dump',
        'Data lokal dengan Room',
        'Tersedia di Google Play',
      ],
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
    id: 'whistleblowing',
    title: {
      en: 'Whistleblowing System DPMPTSP Padang',
      id: 'Whistleblowing System DPMPTSP Padang',
    },
    role: 'Android Developer',
    category: 'Android · Kotlin',
    year: '2025',
    desc: {
      en: 'Android application for anonymous public complaint reporting and internal violation reporting, with a unique tracking code and a secure communication channel between admin and reporter.',
      id: 'Aplikasi Android pelaporan pengaduan publik dan pelanggaran internal secara anonim, dengan tracking code unik serta jalur komunikasi aman antara admin dan pelapor.',
    },
    features: {
      en: [
        'Anonymous complaint submission',
        'Unique tracking code',
        'Secure admin–reporter channel',
        'Material 3 UI',
      ],
      id: [
        'Pengaduan anonim',
        'Tracking code unik',
        'Kanal admin–pelapor yang aman',
        'UI Material 3',
      ],
    },
    stack: ['Kotlin', 'Jetpack Compose', 'Express.js', 'MySQL', 'REST API'],
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
          { name: 'tracking_code', type: 'VARCHAR(30)', key: 'UQ' },
          { name: 'category', type: 'VARCHAR(60)' },
          { name: 'description', type: 'TEXT' },
          { name: 'media_path', type: 'VARCHAR(255)' },
          { name: 'status', type: 'ENUM(open, in_progress, resolved)' },
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
    id: 'dpmptsp-profile',
    title: { en: 'DPMPTSP Padang Profile Website', id: 'Website Profil DPMPTSP Padang' },
    role: 'IT Support / Web Developer (Intern)',
    category: 'Web · Public Service',
    year: '2025',
    desc: {
      en: 'Official profile website for the Padang Investment and One-Stop Integrated Services Office (DPMPTSP) — publishing licensing services, investment information and dynamic content management.',
      id: 'Website profil resmi Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP) Kota Padang — media publikasi layanan perizinan, informasi investasi, dan pengelolaan konten dinamis.',
    },
    features: {
      en: [
        'Public service pages',
        'Investment information',
        'Dynamic content management',
        'Responsive design',
      ],
      id: [
        'Halaman layanan publik',
        'Informasi investasi',
        'Manajemen konten dinamis',
        'Desain responsif',
      ],
    },
    stack: ['PHP', 'Laravel', 'MySQL', 'Docker', 'Tailwind CSS'],
    architecture: [
      { layer: 'Browser', tech: 'Laravel Blade · Tailwind' },
      { layer: 'Controller Layer', tech: 'Laravel (MVC)' },
      { layer: 'Database', tech: 'MySQL · Eloquent ORM' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
          { name: 'role', type: 'ENUM(admin, editor)' },
        ],
      },
      {
        table: 'pages',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'title', type: 'VARCHAR(180)' },
          { name: 'slug', type: 'VARCHAR(200)', key: 'UQ' },
          { name: 'body', type: 'LONGTEXT' },
          { name: 'status', type: 'ENUM(draft, published)' },
          { name: 'updated_at', type: 'DATETIME' },
        ],
      },
    ],
    theme: ['#0ea5e9', '#6366f1'],
    github: 'https://github.com/paybackretr0',
    demo: 'https://dpmptsp.padang.go.id',
  },
  {
    id: 'dpmptsp-visitor',
    title: {
      en: 'DPMPTSP Padang Guest Visit Management',
      id: 'Manajemen Kunjungan Tamu DPMPTSP Padang',
    },
    role: 'IT Support / Web Developer (Intern)',
    category: 'Web · Public Service',
    year: '2025',
    desc: {
      en: 'Web app digitalizing guest registration and visit reservation at DPMPTSP Padang, with an admin dashboard for schedule monitoring and daily/monthly report summaries.',
      id: 'Aplikasi web untuk mendigitalisasi registrasi dan reservasi kunjungan tamu di lingkungan DPMPTSP Kota Padang, dilengkapi dashboard admin untuk pemantauan jadwal kunjungan dan rekap laporan harian/bulanan.',
    },
    features: {
      en: [
        'Guest registration & reservation',
        'Admin dashboard',
        'Visit schedule monitoring',
        'Daily & monthly reports',
      ],
      id: [
        'Registrasi & reservasi tamu',
        'Dashboard admin',
        'Pemantauan jadwal kunjungan',
        'Laporan harian & bulanan',
      ],
    },
    stack: ['PHP', 'Laravel', 'MySQL', 'Docker', 'Tailwind CSS'],
    architecture: [
      { layer: 'Browser', tech: 'Laravel Blade · Tailwind' },
      { layer: 'Controller Layer', tech: 'Laravel (MVC)' },
      { layer: 'Database', tech: 'MySQL · Eloquent ORM' },
    ],
    schema: [
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
          { name: 'scheduled_at', type: 'DATETIME' },
        ],
      },
    ],
    theme: ['#0284c7', '#38bdf8'],
    github: 'https://github.com/paybackretr0',
    demo: 'https://penerimaan-kunjungan.dpmptsp.padang.go.id/',
  },
  {
    id: 'simsapras',
    title: { en: 'SIMSAPRAS UNAND', id: 'SIMSAPRAS UNAND' },
    role: 'Web Developer',
    category: 'Web · Administration',
    year: '2024 – 2025',
    desc: {
      en: 'Reservation and management system for campus facility and asset loaning at Universitas Andalas.',
      id: 'Sistem reservasi dan pengelolaan peminjaman fasilitas dan aset kampus Universitas Andalas.',
    },
    features: {
      en: [
        'Facility booking & scheduling',
        'Asset loaning records',
        'Approval chains',
        'Accurate usage data',
      ],
      id: [
        'Pemesanan & jadwal fasilitas',
        'Catatan peminjaman aset',
        'Alur persetujuan',
        'Data penggunaan akurat',
      ],
    },
    stack: ['PHP', 'Laravel', 'MySQL', 'Docker', 'Tailwind CSS'],
    architecture: [
      { layer: 'Browser', tech: 'Laravel Blade · Tailwind' },
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
    demo: 'https://simsapras.unand.ac.id',
  },
  {
    id: 'bersama-rakyat',
    title: { en: 'BersamaRakyat Android App', id: 'BersamaRakyat Android App' },
    role: 'Android Developer',
    category: 'Android · Civic Engagement',
    year: '2024',
    desc: {
      en: "Android civic-engagement app monitoring the fulfillment of public officials' political promises after inauguration — program tracking, community discussion forums and a political news feed.",
      id: 'Aplikasi civic-engagement Android untuk mengawal pemenuhan janji politik pejabat publik pasca-pelantikan — pelacakan program, forum diskusi masyarakat, dan feed berita politik.',
    },
    features: {
      en: [
        'Political promise tracking',
        'Program progress monitoring',
        'Community discussion forum',
        'Political news feed',
      ],
      id: [
        'Pelacakan janji politik',
        'Pemantauan progres program',
        'Forum diskusi masyarakat',
        'Feed berita politik',
      ],
    },
    stack: ['Kotlin', 'Jetpack Compose', 'Express.js', 'MySQL', 'MVVM'],
    architecture: [
      { layer: 'UI', tech: 'Jetpack Compose' },
      { layer: 'ViewModel', tech: 'MVVM · Coroutines' },
      { layer: 'REST API', tech: 'Node.js · Express.js' },
      { layer: 'Database', tech: 'MySQL' },
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
        table: 'discussions',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'user_id', type: 'INT', key: 'FK' },
          { name: 'promise_id', type: 'INT', key: 'FK' },
          { name: 'message', type: 'TEXT' },
          { name: 'created_at', type: 'DATETIME' },
        ],
      },
    ],
    theme: ['#0f766e', '#2dd4bf'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
  {
    id: 'agrowista',
    title: { en: 'AgroWista Village Tourism App', id: 'Aplikasi Wisata Desa AgroWista' },
    role: 'Android Developer',
    category: 'Android · Tourism',
    year: '2024',
    desc: {
      en: 'Mobile app promoting tourism and products of Leuwimalang Tourism Village — guest mode, point-based location reviews, QR Code product scanning and environmental issue reporting.',
      id: 'Aplikasi mobile promosi wisata dan produk Desa Wisata Leuwimalang — mode tamu, review lokasi berbasis poin, pindaian QR Code produk, dan pelaporan masalah lingkungan.',
    },
    features: {
      en: [
        'Guest mode access',
        'Point-based location reviews',
        'QR Code product scanning',
        'Environment issue reporting',
      ],
      id: [
        'Mode tamu',
        'Review lokasi berbasis poin',
        'Pindaian QR Code produk',
        'Pelaporan masalah lingkungan',
      ],
    },
    stack: ['Kotlin', 'Jetpack Compose', 'Express.js', 'MySQL'],
    architecture: [
      { layer: 'UI', tech: 'Jetpack Compose · XML' },
      { layer: 'ViewModel', tech: 'MVVM' },
      { layer: 'REST API', tech: 'Node.js · Express.js' },
      { layer: 'Database', tech: 'MySQL' },
    ],
    schema: [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(120)' },
          { name: 'email', type: 'VARCHAR(160)', key: 'UQ' },
          { name: 'points', type: 'INT' },
        ],
      },
      {
        table: 'tourism_sites',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'name', type: 'VARCHAR(140)' },
          { name: 'location', type: 'VARCHAR(180)' },
          { name: 'description', type: 'TEXT' },
          { name: 'rating', type: 'DECIMAL(3,2)' },
        ],
      },
      {
        table: 'reviews',
        columns: [
          { name: 'id', type: 'INT', key: 'PK' },
          { name: 'user_id', type: 'INT', key: 'FK' },
          { name: 'site_id', type: 'INT', key: 'FK' },
          { name: 'rating', type: 'TINYINT' },
          { name: 'points_awarded', type: 'INT' },
          { name: 'created_at', type: 'DATETIME' },
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
    theme: ['#15803d', '#4ade80'],
    github: 'https://github.com/paybackretr0',
    demo: '',
  },
]
