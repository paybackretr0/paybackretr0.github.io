export interface SocialLink {
  label: string
  handle: string
  href: string
  icon: 'github' | 'linkedin' | 'instagram' | 'mail'
}

export const site = {
  name: 'Khalied Nauly Maturino',
  shortName: 'Khalied Nauly',
  initials: 'KN',
  role: 'Software Developer',
  focus: 'Mobile & Web Development',
  email: 'khalidmaturino@gmail.com',
  location: 'Padang, Indonesia',
  // Relative paths — resolve correctly under the /porto-lied/ GitHub Pages subpath.
  cv: './cv.pdf',
  portfolio: './porto.pdf',
  github: 'https://github.com/paybackretr0',
  socials: [
    { label: 'GitHub', handle: '@paybackretr0', href: 'https://github.com/paybackretr0', icon: 'github' },
    {
      label: 'LinkedIn',
      handle: '/in/khaliedmtrn',
      href: 'https://www.linkedin.com/in/khaliedmtrn',
      icon: 'linkedin',
    },
    {
      label: 'Instagram',
      handle: '@khaliedmtrn',
      href: 'https://www.instagram.com/khaliedmtrn',
      icon: 'instagram',
    },
    { label: 'Email', handle: 'khalidmaturino@gmail.com', href: 'mailto:khalidmaturino@gmail.com', icon: 'mail' },
  ] satisfies SocialLink[],
} as const
