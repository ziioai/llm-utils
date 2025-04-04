import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "llm-utils",
  description: "Powerful Utilities for LLMs",
  appearance: "dark",

  base: '/llm-utils/',
  outDir: '../docs',

  head: [
    ['link', { rel: 'icon', href: '/llm-utils/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/llm-utils/apple-touch-icon.png' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      // { text: 'Examples', link: '/markdown-examples' }
    ],
    sidebar: [
      {
        text: 'Coming soon',
        items: [
          { text: 'Coming soon', link: '/list' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          // { text: 'Runtime API Examples', link: '/api-examples' },
          { text: 'API Reference', link: '/api' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ziioai/llm-utils' }
    ]
  }
})
