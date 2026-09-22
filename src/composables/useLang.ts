import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import { defaultLang, langFromPath, languages, otherLang, type SiteLang } from '@/data/seo'

export type Lang = SiteLang

const STORAGE_KEY = 'lang'

/**
 * Resolve the initial language. The URL wins over the saved preference: a
 * shared /id/ link has to open in Indonesian even on a device that saw English
 * last, and each prerendered page holds exactly one language's copy.
 */
function resolveInitial(): Lang {
  const fromPath = typeof location !== 'undefined' ? langFromPath(location.pathname) : null
  if (fromPath) return fromPath

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'id') return saved
  } catch {
    /* private mode / unavailable storage */
  }
  return defaultLang
}

/** Active language. Module-level state, shared by every component. */
export const locale = ref<Lang>(resolveInitial())

/**
 * Mirror the language onto <html lang> — screen readers and search engines
 * take pronunciation and language targeting from it, and the static index.html
 * can only ever declare one of the two languages.
 */
function apply(l: Lang) {
  if (typeof document !== 'undefined') document.documentElement.lang = l
}

/**
 * Activate a language, remember it for the next visit to `/` and keep
 * <html lang> in step. The router owns the language through the URL and calls
 * this on every navigation.
 */
export function setLocale(l: Lang) {
  locale.value = l
  apply(l)
  try {
    localStorage.setItem(STORAGE_KEY, l)
  } catch {
    /* ignore */
  }
}

// Applied on first import (App mounts) so the attribute matches the URL before
// the first paint, not only after a toggle.
apply(locale.value)

const translations = {
  en: {
    nav: {
      about: 'About',
      experience: 'Experience',
      projects: 'Projects',
      stack: 'Tech Stack',
      contact: 'Contact',
      resume: 'Resume',
      portfolio: 'Portfolio',
      lightMode: 'Switch to light mode',
      darkMode: 'Switch to dark mode',
    },
    hero: {
      eyebrow: 'Portfolio · 2026',
      role: 'Software Developer',
      tagline: 'Crafting fast, elegant and reliable digital products.',
      desc: 'I build modern Android applications (Kotlin, Jetpack Compose, Flutter) and large-scale web information systems (Laravel, React.js, Node.js) for universities and public institutions.',
      viewProjects: 'View Projects',
      portfolio: 'Portfolio',
      downloadCv: 'Download CV',
      scroll: 'Scroll to explore',
      stats: {
        years: 'Years of experience',
        projects: 'Projects delivered',
        platforms: 'Platforms',
        technologies: 'Technologies',
      },
    },
    about: {
      eyebrow: 'About me',
      title: 'Turning complex problems into simple, scalable software.',
      accent: 'scalable software.',
      p1: "I'm a Software Developer based in Padang, Indonesia, specializing in mobile and web development. I build modern Android apps with Kotlin and Jetpack Compose, Flutter-based multi-platform apps, and large-scale web information systems with Laravel, React.js and Node.js.",
      p2: 'I work with MVC and MVVM architectures, REST API integration and databases like MySQL, SQLite and Redis — always applying clean code principles to deliver scalable, efficient digital solutions.',
      p3: 'Currently a Developer & Programmer intern at PT Persero Batam through the MagangHub program, an alumnus of Bangkit Academy 2024, and a national hackathon awardee.',
      currentLabel: 'Currently',
      currentRole: 'Developer & Programmer — PT Persero Batam',
      currentOrg: 'Batam, Indonesia',
      factsLabel: 'Quick facts',
      facts: {
        based: 'Based in',
        email: 'Email',
        education: 'Education',
        focus: 'Focus',
        status: 'Status',
      },
      educationValue: 'S1 Information Systems · IPK 3.77',
      statusValue: 'Open to collaborations',
      focusValue: 'Mobile · Web · API design',
      strengths: 'Core strengths',
      strengthsList: [
        'Android (Kotlin & Compose)',
        'Flutter multi-platform',
        'Laravel & React.js',
        'REST API design',
        'Databases & caching',
        'Clean architecture',
      ],
    },
    experience: {
      eyebrow: 'Journey',
      title: 'Experience & milestones',
      desc: 'A look at where I have worked, built and learned along the way.',
      present: 'Present',
      groups: {
        work: 'Work & internship',
        organization: 'Organization',
        education: 'Education',
      },
    },
    projects: {
      eyebrow: 'All work',
      title: "All the projects I've built",
      accent: 'built',
      desc: 'Web information systems and Android applications designed, built and shipped across universities, government agencies and organizations.',
      features: 'Key features',
      code: 'Source code',
      demo: 'Live demo',
      more: 'More projects on GitHub',
      stream: {
        gitLog: 'git log --graph --oneline',
        main: 'main',
        all: 'All',
        head: 'HEAD',
        web: 'web',
        mobile: 'mobile',
        details: 'Inspect',
        hint: 'Click a commit to inspect architecture & schema',
      },
      drawer: {
        architecture: 'System architecture',
        schema: 'Database schema',
        close: 'Close details',
      },
    },
    stack: {
      eyebrow: 'Toolbox',
      title: 'My tech stack',
      desc: 'The technologies I use to design, build and ship products end to end.',
    },
    achievements: {
      eyebrow: 'Milestones',
      title: 'Achievements & recognition',
      desc: 'Certifications, hackathons and awards along the journey.',
      certification: 'Certification',
      award: 'Award',
      hackathon: 'Hackathon',
    },
    contact: {
      eyebrow: 'Contact',
      title: "Let's build something great together.",
      accent: 'great',
      desc: 'Have a project in mind, an opportunity, or just want to say hi? My inbox is always open.',
      emailCta: 'Send me an email',
      reply: 'I usually reply within 24 hours.',
    },
    footer: {
      tagline: 'Software Developer crafting fast, elegant digital products.',
      rights: 'All rights reserved.',
      built: 'Designed & built with Vue 3, Tailwind CSS and motion-v.',
      backToTop: 'Back to top',
    },
  },
  id: {
    nav: {
      about: 'Tentang',
      experience: 'Pengalaman',
      projects: 'Proyek',
      stack: 'Teknologi',
      contact: 'Kontak',
      resume: 'CV',
      portfolio: 'Portofolio',
      lightMode: 'Ganti ke mode terang',
      darkMode: 'Ganti ke mode gelap',
    },
    hero: {
      eyebrow: 'Portofolio · 2026',
      badge: 'Terbuka untuk peluang baru',
      role: 'Software Developer',
      tagline: 'Membuat produk digital yang cepat, elegan, dan andal.',
      desc: 'Saya membangun aplikasi Android modern (Kotlin, Jetpack Compose, Flutter) dan sistem informasi web berskala besar (Laravel, React.js, Node.js) untuk universitas dan instansi publik.',
      viewProjects: 'Lihat Proyek',
      portfolio: 'Portofolio',
      downloadCv: 'Unduh CV',
      scroll: 'Gulir untuk menjelajah',
      stats: {
        years: 'Tahun pengalaman',
        projects: 'Proyek selesai',
        platforms: 'Platform',
        technologies: 'Teknologi',
      },
    },
    about: {
      eyebrow: 'Tentang saya',
      title: 'Mengubah masalah kompleks menjadi perangkat lunak yang sederhana dan skalabel.',
      accent: 'skalabel.',
      p1: 'Saya adalah Software Developer berbasis di Padang, Indonesia, yang berfokus pada pengembangan mobile dan web. Saya membangun aplikasi Android modern dengan Kotlin dan Jetpack Compose, aplikasi multi-platform dengan Flutter, serta sistem informasi web berskala besar dengan Laravel, React.js dan Node.js.',
      p2: 'Saya terbiasa menggunakan arsitektur MVC dan MVVM, integrasi REST API, serta manajemen database seperti MySQL, SQLite dan Redis — selalu menerapkan prinsip clean code untuk menghasilkan solusi digital yang skalabel dan efisien.',
      p3: 'Saat ini menjalani magang sebagai Developer & Programmer di PT Persero Batam melalui program MagangHub, alumni Bangkit Academy 2024, dan peraih penghargaan hackathon nasional.',
      currentLabel: 'Saat ini',
      currentRole: 'Developer & Programmer — PT Persero Batam',
      currentOrg: 'Batam, Indonesia',
      factsLabel: 'Fakta singkat',
      facts: {
        based: 'Berbasis di',
        email: 'Email',
        education: 'Pendidikan',
        focus: 'Fokus',
        status: 'Status',
      },
      educationValue: 'S1 Sistem Informasi · IPK 3.77',
      statusValue: 'Terbuka untuk kolaborasi',
      focusValue: 'Mobile · Web · Desain API',
      strengths: 'Keahlian utama',
      strengthsList: [
        'Android (Kotlin & Compose)',
        'Flutter multi-platform',
        'Laravel & React.js',
        'Desain REST API',
        'Database & caching',
        'Clean architecture',
      ],
    },
    experience: {
      eyebrow: 'Perjalanan',
      title: 'Pengalaman & pencapaian',
      desc: 'Sepanjang perjalanan saya bekerja, membangun, dan belajar.',
      present: 'Sekarang',
      groups: {
        work: 'Kerja & magang',
        organization: 'Organisasi',
        education: 'Pendidikan',
      },
    },
    projects: {
      eyebrow: 'Semua karya',
      title: 'Semua proyek yang saya bangun',
      accent: 'bangun',
      desc: 'Sistem informasi web dan aplikasi Android yang dirancang, dibangun, dan diluncurkan untuk universitas, instansi pemerintah, dan organisasi.',
      features: 'Fitur utama',
      code: 'Kode sumber',
      demo: 'Demo langsung',
      more: 'Proyek lainnya di GitHub',
      stream: {
        gitLog: 'git log --graph --oneline',
        main: 'main',
        all: 'Semua',
        head: 'HEAD',
        web: 'web',
        mobile: 'mobile',
        details: 'Inspect',
        hint: 'Klik commit untuk melihat arsitektur & skema',
      },
      drawer: {
        architecture: 'Arsitektur sistem',
        schema: 'Skema database',
        close: 'Tutup detail',
      },
    },
    stack: {
      eyebrow: 'Peralatan',
      title: 'Tech stack saya',
      desc: 'Teknologi yang saya gunakan untuk merancang, membangun, dan meluncurkan produk secara menyeluruh.',
    },
    achievements: {
      eyebrow: 'Pencapaian',
      title: 'Prestasi & pengakuan',
      desc: 'Sertifikasi, hackathon, dan penghargaan di sepanjang perjalanan.',
      certification: 'Sertifikasi',
      award: 'Penghargaan',
      hackathon: 'Hackathon',
    },
    contact: {
      eyebrow: 'Kontak',
      title: 'Mari membangun sesuatu yang hebat bersama.',
      accent: 'hebat',
      desc: 'Punya proyek, peluang, atau sekadar ingin menyapa? Inbox saya selalu terbuka.',
      emailCta: 'Kirim email',
      reply: 'Saya biasanya membalas dalam 24 jam.',
    },
    footer: {
      tagline: 'Software Developer yang membuat produk digital cepat dan elegan.',
      rights: 'Hak cipta dilindungi.',
      built: 'Dirancang & dibangun dengan Vue 3, Tailwind CSS, dan motion-v.',
      backToTop: 'Kembali ke atas',
    },
  },
}

export function useLang() {
  const router = useRouter()

  /**
   * Switch languages. Each language lives at its own URL, so the toggle
   * navigates instead of only swapping state — the router applies the language
   * and its head tags, and the address bar stays shareable.
   */
  const toggleLang = () => {
    const next = otherLang(locale.value)
    setLocale(next)
    void router.push(languages[next].path)
  }

  const t = computed(() => translations[locale.value])

  return { locale, toggleLang, t }
}
