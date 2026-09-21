export type AchievementType = 'certification' | 'award' | 'hackathon'

export interface Achievement {
  id: string
  type: AchievementType
  year: string
  title: { en: string; id: string }
  org: { en: string; id: string }
  desc: { en: string; id: string }
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
