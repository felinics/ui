import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Tests live in `src/**/__tests__/` — the path tsconfig.json already excludes
// from `vue-tsc --build`, so a test file can never widen the shipped surface.
//
// Scope note: this is NOT a "test every component" harness. The library's three
// enforcement layers (tokens / this contract / the guard) all read SOURCE TEXT,
// which makes them blind to one specific class of defect: a composition that
// type-checks and whose class strings are all legal, but whose RENDERED DOM
// puts them on the wrong element. Reach for a test here only when a contract
// promise is invisible to the other three layers — see Button's as-child test.
export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/__tests__/*.test.ts'],
  },
}))
