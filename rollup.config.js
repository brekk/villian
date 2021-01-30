import path from 'path'
import alias from '@rollup/plugin-alias'
import shebang from 'rollup-plugin-add-shebang'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import cjs from '@rollup/plugin-commonjs'
import { map, pipe } from 'ramda'

import pkg from './package.json'

const mapLocal = pipe(
  map(z =>
    Object.assign({}, z, {
      replacement: path.resolve(__dirname, z.replacement)
    })
  )
)

const plugins = [
  babel({ exclude: 'node_modules/**' }),
  resolve({ preferBuiltins: true }),
  cjs({
    include: /node_modules/
  }),
  shebang({include: 'villian.js'})
]

const FILES = {
  VILLIAN: ['src/index.js', 'villian']
}
const buildFor = inputs => {
  const name = pkg.name
  const generatePathing = ([input, output]) => [
    {
      input,
      external: ['path', 'fs'],
      output: {
        file: `${output}.js`,
        format: `cjs`,
        exports: 'named'
      },
      plugins
    }
  ]
  const out = inputs
    .map(generatePathing)
    .reduce((a, b) => a.concat(b), [])
  return out
}

export default buildFor([FILES.VILLIAN])
