import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({

  // 自动生成dts声明文件
  // 该插件支持传递配置项
  // 如配置: dts({ tsconfigPath: './tsconfig.json '})，表示读取tsconfig.json的include、exclude配置
  plugins: [dts()],

  // https://www.nowcoder.com/discuss/513677605841788928
  // vite默认会打包出 UMD 和 ES Module 两种导出方式的文件，以下配置会打包出两份结果：
  // llm-utils.umd.js UMD 导出方式，兼容 amd CommonJS
  // llm-utils.mjs ES Module 导出方式
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/llm-utils.ts'),
      name: 'llm-utils',
      // 构建好的文件名（不包括文件后缀）
      fileName: 'llm-utils',
    },
    rollupOptions: {
      // 确保外部化处理那些
      // 你不想打包进库的依赖
      external: [
        'vue',
        'zod',
        'lodash', 'json5', 'axios', 'openai',
      ],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖
        // 提供一个全局变量
        globals: {
          vue: 'Vue',
          zod: 'z',
          lodash: '_',
          json5: 'JSON5',
          axios: 'axios',
          openai: 'OpenAI',
        },
      },
    },
  },
})
