import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Examduler",
  titleTemplate: ":title | Examduler Docs",
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  description: "A lightweight yet powerful exam management app for teachers and students.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation Hub', link: '/docs' },
    ],

    logo: '/examduler_logo_trans_full.png',

    sidebar: [
      {
        text: 'Examination',
        items: [
          { text: 'Examination Docs', link: '/exam' },
        ],
      },
      {
        text: 'Organization',
        items: [
          { text: 'Organization Docs', link: '/org' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ingStudiosOfficial/examduler' }
    ],

    lastUpdated: {
      text: 'Last updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium',
      }
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('md-'),
      },
    },
  },
});
