export type ExperienceType = 'internship' | 'organization' | 'education'

export interface ExperienceEntry {
  id: string
  type: ExperienceType
  period: string
  role: { en: string; id: string }
  org: { en: string; id: string }
  desc: { en: string; id: string }
}

export const experience: ExperienceEntry[] = [
  {
    id: 'dti-unand',
    type: 'internship',
    period: '2026 – Present',
    role: { en: 'Junior Programmer (Intern)', id: 'Junior Programmer (Magang)' },
    org: { en: 'IT Directorate, Universitas Andalas', id: 'Direktorat Teknologi Informasi Universitas Andalas' },
    desc: {
      en: 'Developing the web-based Temporary Leave (BSS) submission system to digitize student administration, and contributing to internal campus dashboards and information systems.',
      id: 'Mengembangkan sistem pengajuan Berhenti Studi Sementara (BSS) berbasis web untuk digitalisasi administrasi mahasiswa, serta berkontribusi pada dashboard dan sistem informasi internal kampus.',
    },
  },
  {
    id: 'dpmptsp',
    type: 'internship',
    period: '2025',
    role: { en: 'IT Support Intern', id: 'IT Support (Magang)' },
    org: { en: 'Dinas PMPTSP Kota Padang', id: 'Dinas PMPTSP Kota Padang' },
    desc: {
      en: 'Built the official DPMPTSP Padang profile website and guest/visit reception website with Laravel & MySQL, while handling device troubleshooting, network maintenance and office technical support.',
      id: 'Membangun website profil resmi DPMPTSP Padang dan website penerimaan tamu/kunjungan dengan Laravel & MySQL, sekaligus menangani troubleshooting perangkat, pemeliharaan jaringan, dan dukungan teknis kantor.',
    },
  },
  {
    id: 'lab-tata-kelola',
    type: 'organization',
    period: '2025',
    role: { en: 'Head of Household Division', id: 'Koordinator Divisi Rumah Tangga' },
    org: { en: 'IT Governance & Infrastructure Lab, UNAND', id: 'Laboratorium Tata Kelola & Infrastruktur TI UNAND' },
    desc: {
      en: 'Managed laboratory asset records and inventory documentation to keep infrastructure tracking accurate and organized.',
      id: 'Mengelola pencatatan aset laboratorium dan dokumentasi inventaris agar pelacakan infrastruktur tetap akurat dan tertata.',
    },
  },
  {
    id: 'lab-daskom',
    type: 'organization',
    period: '2024 – 2025',
    role: { en: 'Public Relations Division Member', id: 'Anggota Divisi Humas' },
    org: { en: 'Basic Computing Lab, UNAND', id: 'Laboratorium Dasar Komputasi UNAND' },
    desc: {
      en: 'Managed external communications and published laboratory activities to keep the community informed.',
      id: 'Mengelola komunikasi eksternal dan publikasi kegiatan laboratorium agar komunitas tetap terinformasi.',
    },
  },
  {
    id: 'education',
    type: 'education',
    period: '2022 – 2026',
    role: { en: 'S1 Information Systems', id: 'S1 Sistem Informasi' },
    org: { en: 'Universitas Andalas', id: 'Universitas Andalas' },
    desc: {
      en: 'Information Systems undergraduate with a GPA of 3.76 / 4.00, expected to graduate in September 2026.',
      id: 'Mahasiswa S1 Sistem Informasi dengan IPK 3.76 / 4.00, ekspektasi lulus September 2026.',
    },
  },
]
