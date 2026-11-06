export type AchievementType = 'certification' | 'award' | 'hackathon'

export interface Achievement {
  id: string
  type: AchievementType
  year: string
  title: { en: string; id: string }
  org: { en: string; id: string }
  desc: { en: string; id: string }
  /** Optional public credential page, rendered as a "verify" link. */
  href?: string
}

export const achievements: Achievement[] = [
  {
    id: 'bangkit',
    type: 'certification',
    year: '2024',
    title: { en: 'Bangkit Academy Alumni', id: 'Alumni Bangkit Academy' },
    org: { en: 'Google, Tokopedia, Gojek, Traveloka', id: 'Google, Tokopedia, Gojek, Traveloka' },
    desc: {
      en: 'Completed the intensive Google-backed program covering modern Android development and professional skills.',
      id: 'Menyelesaikan program intensif dukungan Google yang mencakup pengembangan Android modern dan keterampilan profesional.',
    },
  },
  {
    id: 'red-team-leaders-ccep',
    type: 'certification',
    year: '2026',
    title: {
      en: 'Certified Cybersecurity Educator Professional (CCEP)',
      id: 'Certified Cybersecurity Educator Professional (CCEP)',
    },
    org: { en: 'Red Team Leaders', id: 'Red Team Leaders' },
    desc: {
      en: 'Passed the CCEP exam after completing every requirement of the Red Team Leaders cybersecurity educator track.',
      id: 'Lulus ujian CCEP setelah menyelesaikan seluruh persyaratan jalur pendidik keamanan siber Red Team Leaders.',
    },
    href: 'https://courses.redteamleaders.com/exam-completion/436802c8c8908ab0',
  },
  {
    id: 'dta-network-administrator',
    type: 'certification',
    year: '2026',
    title: {
      en: 'Fundamental of Associate Network Administrator — National',
      id: 'Fundamental of Associate Network Administrator — Nasional',
    },
    org: {
      en: 'Digital Talent Academy — Digital Talent Scholarship 2026',
      id: 'Digital Talent Academy — Digital Talent Scholarship 2026',
    },
    desc: {
      en: 'Completed the 12-hour national training run by the Digital Talent Development Centre, 3 March – 31 December 2026.',
      id: 'Menyelesaikan pelatihan nasional 12 jam pelatihan yang diselenggarakan Pusat Pengembangan Talenta Digital, 3 Maret – 31 Desember 2026.',
    },
  },
  {
    id: 'impact-hackathon',
    type: 'hackathon',
    year: '2024',
    title: {
      en: '2nd Place — Impact National Hackathon',
      id: 'Juara II — Impact National Hackathon',
    },
    org: { en: 'Maxy Academy', id: 'Maxy Academy' },
    desc: {
      en: 'Placed second in a national hackathon with a civic-tech solution built under time pressure.',
      id: 'Meraih juara kedua dalam hackathon nasional dengan solusi civic-tech yang dibangun di bawah tekanan waktu.',
    },
  },
  {
    id: 'cybertech-hackathon',
    type: 'hackathon',
    year: '2024',
    title: {
      en: '3rd Place — National Cybertech Hackathon',
      id: 'Juara III — Hackathon Nasional Cybertech',
    },
    org: { en: 'Politeknik Negeri Padang', id: 'Politeknik Negeri Padang' },
    desc: {
      en: 'Won third place in a national hackathon, competing against teams from across Indonesia.',
      id: 'Meraih juara ketiga dalam hackathon nasional, bersaing dengan tim dari berbagai daerah di Indonesia.',
    },
  },
  {
    id: 'gold-medal-dampak',
    type: 'award',
    year: '2026',
    title: {
      en: 'Gold Medal Kategori Poster — Mahasiswa Berdampak Seminar',
      id: 'Medali Emas Kategori Poster — Seminar Mahasiswa Berdampak',
    },
    org: {
      en: 'Program Mahasiswa Berdampak',
      id: 'Program Mahasiswa Berdampak',
    },
    desc: {
      en: 'Gold Medal for the impact of the Mahasiswa Berdampak program: community empowerment in disaster recovery across Sumatra, 2026.',
      id: 'Medali Emas pada Seminar Dampak Pelaksanaan Program Mahasiswa Berdampak: Pemberdayaan Masyarakat dalam Pemulihan Dampak Bencana di Sumatra Tahun 2026.',
    },
  },
]
