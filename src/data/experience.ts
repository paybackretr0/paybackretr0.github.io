export type ExperienceGroup = 'work' | 'organization' | 'education'

export interface ExperienceEntry {
  id: string
  /** Which block of the timeline this entry belongs to. */
  group: ExperienceGroup
  period: string
  role: { en: string; id: string }
  org: { en: string; id: string }
  desc: { en: string; id: string }
}

/** Entries are rendered in array order, newest first inside each group. */
export const experience: ExperienceEntry[] = [
  {
    id: 'persero-batam',
    group: 'work',
    period: '2026 – Present',
    role: { en: 'Developer & Programmer', id: 'Developer & Programmer' },
    org: { en: 'PT Persero Batam', id: 'PT Persero Batam' },
    desc: {
      en: 'Placed through the MagangHub internship program (Ministry of Manpower of Indonesia) at PT Persero Batam as Developer & Programmer.',
      id: 'Ditempatkan melalui program magang MagangHub (Kementerian Ketenagakerjaan) di PT Persero Batam sebagai Developer & Programmer.',
    },
  },
  {
    id: 'kemahasiswaan-unand',
    group: 'work',
    period: '2026',
    role: { en: 'Freelance Programmer', id: 'Programmer Freelance' },
    org: {
      en: 'Directorate of Student Affairs, Universitas Andalas',
      id: 'Direktorat Kemahasiswaan Universitas Andalas',
    },
    desc: {
      en: 'Co-developed a full-stack Outcome-Based Education (OBE) academic information system (SIAKAD) with React JS, Node.js/Express and MySQL as part of a two-person team. Focused on the student affairs modules — academic advising (dosen PA) with bulk assignment and management of students without an advisor, KRS and cross-major enrollment workflows, class/schedule management, and learning outcome reporting (CP/CPMK).',
      id: 'Mengembangkan bersama tim dua orang sistem informasi akademik Outcome-Based Education (OBE) atau SIAKAD full-stack menggunakan React JS, Node.js/Express, dan MySQL. Berfokus pada modul kemahasiswaan — bimbingan akademik (dosen PA) dengan penugasan massal dan pengelolaan mahasiswa tanpa pembimbing, alur KRS dan pendaftaran lintas prodi, manajemen kelas/jadwal, serta pelaporan capaian pembelajaran (CP/CPMK).',
    },
  },
  {
    id: 'dti-unand',
    group: 'work',
    period: '2026',
    role: { en: 'Junior Programmer (Intern)', id: 'Junior Programmer (Magang)' },
    org: {
      en: 'IT Directorate, Universitas Andalas',
      id: 'Direktorat Teknologi Informasi Universitas Andalas',
    },
    desc: {
      en: 'Developed a web-based Temporary Study Leave (BSS) submission system to digitize student administrative processes, and contributed to the development of internal dashboards and information systems for Universitas Andalas.',
      id: 'Mengembangkan sistem pengajuan Berhenti Studi Sementara (BSS) berbasis web untuk mendigitalisasi proses administrasi mahasiswa, serta berkontribusi pada pengembangan dashboard dan sistem informasi internal Universitas Andalas.',
    },
  },
  {
    id: 'neo-telemetri',
    group: 'work',
    period: '2026',
    role: {
      en: 'Project Manager & Software Developer',
      id: 'Project Manager & Software Developer',
    },
    org: { en: 'PT Neo Telemetri Software', id: 'PT Neo Telemetri Software' },
    desc: {
      en: 'Managed project planning, task allocation, team coordination and progress monitoring throughout the software development lifecycle, while contributing directly to requirements analysis, feature implementation, debugging and deployment. Developed the Universitas Andalas Non-APBN Scholarship Information System as the company-assigned final project.',
      id: 'Mengelola perencanaan proyek, alokasi tugas, koordinasi tim, dan pemantauan progres sepanjang siklus pengembangan perangkat lunak, sekaligus berkontribusi langsung pada analisis kebutuhan, implementasi fitur, debugging, dan deployment. Mengembangkan Sistem Informasi Beasiswa Non-APBN Universitas Andalas sebagai proyek akhir penugasan perusahaan.',
    },
  },
  {
    id: 'asisten-pemrograman-mobile',
    group: 'work',
    period: '2025',
    role: { en: 'Teaching Assistant', id: 'Asisten Dosen' },
    org: { en: 'Mobile Programming Course', id: 'Mata Kuliah Pemrograman Mobile' },
    desc: {
      en: 'Developed Android learning modules with Kotlin and Jetpack Compose, and taught and guided students in practical Android application development — assisting with debugging, problem-solving and programming assignments.',
      id: 'Mengembangkan modul pembelajaran Android dengan Kotlin dan Jetpack Compose, serta mengajar dan membimbing mahasiswa dalam praktik pengembangan aplikasi Android — membantu debugging, pemecahan masalah, dan penyelesaian tugas pemrograman.',
    },
  },
  {
    id: 'dpmptsp',
    group: 'work',
    period: '2025',
    role: { en: 'IT Support Intern', id: 'IT Support (Magang)' },
    org: { en: 'Dinas PMPTSP Kota Padang', id: 'Dinas PMPTSP Kota Padang' },
    desc: {
      en: 'Developed the official DPMPTSP Padang profile website and a visitor management website with Laravel and MySQL, while providing technical support including device troubleshooting, network maintenance and operational IT assistance.',
      id: 'Mengembangkan website profil resmi DPMPTSP Padang dan website manajemen kunjungan tamu dengan Laravel dan MySQL, sekaligus memberikan dukungan teknis meliputi troubleshooting perangkat, pemeliharaan jaringan, dan bantuan IT operasional.',
    },
  },
  {
    id: 'aset-unand',
    group: 'work',
    period: '2024 – 2025',
    role: { en: 'Programmer', id: 'Programmer' },
    org: {
      en: 'Directorate of General Affairs & Asset Management, Universitas Andalas',
      id: 'Direktorat Umum dan Pengelolaan Aset Universitas Andalas',
    },
    desc: {
      en: 'Developed a web-based facility and infrastructure borrowing information system with Laravel and MySQL — facility search, borrowing requests, approval workflows and borrowing status monitoring. Also managed the facility, user and borrowing transaction modules, adapting the system to business process requirements.',
      id: 'Mengembangkan sistem informasi peminjaman fasilitas dan prasarana berbasis web dengan Laravel dan MySQL — pencarian fasilitas, pengajuan peminjaman, alur persetujuan, dan pemantauan status peminjaman. Mengelola modul fasilitas, pengguna, dan transaksi peminjaman serta menyesuaikan sistem dengan kebutuhan proses bisnis.',
    },
  },
  {
    id: 'biner',
    group: 'organization',
    period: '2026',
    role: { en: 'Chairperson', id: 'Ketua' },
    org: {
      en: 'BINER Faculty Student Activity Unit, Universitas Andalas',
      id: 'Unit Kegiatan Mahasiswa Fakultas BINER Universitas Andalas',
    },
    desc: {
      en: 'Led the revitalization and re-establishment of BINER at the Faculty of Information Technology, Universitas Andalas — shaping its vision, mission, organizational structure and work programs. Coordinated members in skill development, technology and community service activities, and built collaborations with faculty members, student organizations, communities and external stakeholders.',
      id: 'Memimpin revitalisasi dan pendirian ulang BINER di Fakultas Teknologi Informasi Universitas Andalas — menyusun visi, misi, struktur organisasi, dan program kerja. Mengoordinasikan anggota dalam kegiatan pengembangan keterampilan, teknologi, dan pengabdian masyarakat, serta membangun kolaborasi dengan dosen, organisasi mahasiswa, komunitas, dan pihak eksternal.',
    },
  },
  {
    id: 'neo-telemetri-oc',
    group: 'organization',
    period: '2025',
    role: {
      en: 'Organizing Committee Division Coordinator',
      id: 'Koordinator Divisi Organizing Committee',
    },
    org: { en: 'Neo Telemetri Student Organization', id: 'UKM Neo Telemetri Universitas Andalas' },
    desc: {
      en: 'Created and managed organizational activity timelines from the beginning to the end of the term, coordinating committee activities and ensuring effective event management throughout the organization period.',
      id: 'Menyusun dan mengelola timeline kegiatan organisasi dari awal hingga akhir kepengurusan, mengoordinasikan aktivitas kepanitiaan, dan memastikan manajemen acara berjalan efektif sepanjang periode kepengurusan.',
    },
  },
  {
    id: 'firetech-2025',
    group: 'organization',
    period: '2025',
    role: { en: 'Event Division Member', id: 'Anggota Divisi Acara' },
    org: {
      en: 'Firetech 2025 · Neo Telemetri Student Organization',
      id: 'Firetech 2025 · UKM Neo Telemetri',
    },
    desc: {
      en: 'Served as Person in Charge (PIC) of the Hackathon competition of Firetech 2025, a national competition, and coordinated the two-day event implementation — managing on-site coordination, communication with judges, and keeping the event on schedule.',
      id: 'Menjadi Person in Charge (PIC) kompetisi Hackathon Firetech 2025 (kompetisi nasional) dan mengoordinasikan pelaksanaan acara dua hari — mengelola koordinasi lapangan, komunikasi dengan dewan juri, dan memastikan acara berjalan sesuai jadwal.',
    },
  },
  {
    id: 'open-recruitment-14',
    group: 'organization',
    period: '2025',
    role: { en: 'Event Division Coordinator', id: 'Koordinator Divisi Acara' },
    org: {
      en: 'Open Recruitment 14 · Neo Telemetri Student Organization',
      id: 'Open Recruitment 14 · UKM Neo Telemetri',
    },
    desc: {
      en: 'Designed event timelines and activity plans, prepared equipment and resource requirements, and managed overall event schedules and coordination.',
      id: 'Merancang timeline dan rencana kegiatan, menyiapkan kebutuhan peralatan dan sumber daya, serta mengelola jadwal dan koordinasi acara secara keseluruhan.',
    },
  },
  {
    id: 'lab-tata-kelola',
    group: 'organization',
    period: '2025',
    role: { en: 'Head of Household Division', id: 'Koordinator Divisi Rumah Tangga' },
    org: {
      en: 'IT Governance & Infrastructure Lab, UNAND',
      id: 'Laboratorium Tata Kelola & Infrastruktur TI UNAND',
    },
    desc: {
      en: 'Managed laboratory asset records and inventory documentation to keep infrastructure tracking accurate and organized.',
      id: 'Mengelola pencatatan aset laboratorium dan dokumentasi inventaris agar pelacakan infrastruktur tetap akurat dan tertata.',
    },
  },
  {
    id: 'lab-daskom',
    group: 'organization',
    period: '2024 – 2025',
    role: { en: 'Public Relations Division Member', id: 'Anggota Divisi Humas' },
    org: { en: 'Basic Computing Lab, UNAND', id: 'Laboratorium Dasar Komputasi UNAND' },
    desc: {
      en: 'Managed external communication and published laboratory programs to keep the community informed.',
      id: 'Mengelola komunikasi eksternal dan publikasi program laboratorium agar komunitas tetap terinformasi.',
    },
  },
  {
    id: 'education',
    group: 'education',
    period: '2022 – 2026',
    role: { en: 'S1 Information Systems', id: 'S1 Sistem Informasi' },
    org: { en: 'Universitas Andalas', id: 'Universitas Andalas' },
    desc: {
      en: 'Graduate of the Information Systems undergraduate programme with a GPA of 3.77 / 4.00 — graduated on 23 July 2026, with the graduation ceremony on 18 September 2026.',
      id: 'Lulusan S1 Sistem Informasi dengan IPK 3.77 / 4.00 — lulus 23 Juli 2026 dan diwisuda 18 September 2026.',
    },
  },
]
