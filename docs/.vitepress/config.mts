import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Examduler",
  description: "A lightweight yet powerful exam management app for teachers and students",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examination', link: '/exam' },
      { text: 'Organization', link: '/org' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Examination Help', link: '/exam' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ingStudiosOfficial/examduler' }
    ]
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('md-'),
      },
    },
  },
});
