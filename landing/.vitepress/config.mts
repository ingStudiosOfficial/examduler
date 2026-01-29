import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Examduler",
  titleTemplate: ":title | Examduler",
  description: "A lightweight yet powerful exam management app for educators and students.",
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '/examduler_logo_trans_full.png',

    nav: [
      { text: 'Documentation Hub', link: 'https://docs.examduler.ingstudios.dev' },
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
  }
})
