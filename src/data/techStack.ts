export interface TechGroup {
  id: string
  label: { en: string; id: string }
  icon: 'language' | 'frontend' | 'backend' | 'mobile' | 'database' | 'devops' | 'tools' | 'architecture'
  items: string[]
}

export const techStack: TechGroup[] = [
  {
    id: 'languages',
    label: { en: 'Languages', id: 'Bahasa Pemrograman' },
    icon: 'language',
    items: ['Kotlin', 'Dart', 'JavaScript', 'TypeScript', 'PHP'],
  },
  {
    id: 'frontend',
    label: { en: 'Web Frontend', id: 'Web Frontend' },
    icon: 'frontend',
    items: ['React.js', 'Vue.js', 'Vite', 'Tailwind CSS', 'Ant Design', 'HTML5', 'CSS3'],
  },
  {
    id: 'backend',
    label: { en: 'Web Backend', id: 'Web Backend' },
    icon: 'backend',
    items: ['Laravel (PHP)', 'Node.js', 'Express.js', 'RESTful API', 'Sequelize ORM'],
  },
  {
    id: 'mobile',
    label: { en: 'Mobile', id: 'Mobile' },
    icon: 'mobile',
    items: ['Android SDK', 'Jetpack Compose', 'Flutter', 'XML Layout', 'Coroutines', 'Room Database'],
  },
  {
    id: 'database',
    label: { en: 'Database & Caching', id: 'Database & Caching' },
    icon: 'database',
    items: ['MySQL', 'PostgreSQL', 'SQLite', 'Redis'],
  },
  {
    id: 'devops',
    label: { en: 'DevOps', id: 'DevOps' },
    icon: 'devops',
    items: ['Git', 'GitHub', 'Docker', 'Containerization', 'Linux (Ubuntu)'],
  },
  {
    id: 'tools',
    label: { en: 'Tools', id: 'Tools' },
    icon: 'tools',
    items: ['Postman', 'Android Studio', 'VS Code', 'Figma'],
  },
  {
    id: 'architecture',
    label: { en: 'Architecture & Patterns', id: 'Arsitektur & Pola Desain' },
    icon: 'architecture',
    items: ['MVC', 'MVVM', 'Clean Architecture', 'Multi-Role Authentication'],
  },
]
