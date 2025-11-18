import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'libs/index.ts'),
      name: 'ChunkProcess',
      fileName: 'index',
      formats: ['cjs', 'es']
    },
    rollupOptions: {
      external: []
    },
    sourcemap: true,
    target: 'es2016'
  },
  plugins: [
    dts({
      include: ['libs/**/*.ts'],
      outDir: 'dist'
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.{test,spec}.{ts,js}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
