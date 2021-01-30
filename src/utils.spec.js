import path from 'path'
import stripColor from 'strip-color'
import { resolve, fork } from 'fluture'
import {
  filter,
  startsWith,
  map,
  identity as I,
  trim,
  curry,
  C,
  readFile,
  split,
  pipe
} from 'snang/script'
import {
  swapNull,
  indexedArray,
  getArgs,
  convertDataToErrors,
  concatenateCauses,
  filterRelativeToStdIn,
  validateSyntax,
  structurizeArrays,
  swapToRejectionBranch,
  structureData,
  stripAtSign,
  skipSomeGlobals,
  invalidRelativeToNames,
  solveValidity,
  unfoldLeadingSlashes,
  matchMatchKeywordOrRegionOnly,
  villianWithOptions
} from './utils'
const FIXTURE = path.resolve(
  __dirname,
  '../fixtures/madlib-broken.vim'
)

test('indexedArray', () => {
  expect(indexedArray('cool')('yes')).toEqual(['yes', 'cool'])
})

test('convertDataToErrors', () => {
  const output = convertDataToErrors([['a', [['b', 'c']]]])
  expect(output).toEqual(['Unexpected reference in a (c=b)'])
})

test('concatenateCauses', () => {
  const output = concatenateCauses([
    'raw',
    {
      contains: ['a', 'b', 'c'],
      nextgroup: 'jkl'.split(''),
      matchgroup: 'xyz'.split('')
    }
  ])
  expect(output).toEqual([
    'raw',
    [
      ['x', 'matchgroup'],
      ['y', 'matchgroup'],
      ['z', 'matchgroup'],
      ['j', 'nextgroup'],
      ['k', 'nextgroup'],
      ['l', 'nextgroup'],
      ['a', 'contains'],
      ['b', 'contains'],
      ['c', 'contains']
    ]
  ])
})

test('filterRelativeToStdIn', () => {
  const getFlags = validate => () => ({ validate })
  const raw = [
    ['a', 'alpha'],
    ['b', 'beta']
  ]
  const output = filterRelativeToStdIn(getFlags('b'), raw)
  expect(output).toEqual([['b', 'beta']])
})

test('validateSyntax', () => {
  const getFlags = () => ({ validate: '' })
  const raw = JSON.stringify({
    syntaxes: [
      {
        valid: true,
        name: 'dope',
        expected: {
          matchgroup: ['yes'],
          nextgroup: [],
          contains: []
        }
      },
      {
        valid: false,
        name: 'yes',
        expected: {
          matchgroup: [],
          nextgroup: [],
          contains: ['dolphin']
        }
      }
    ]
  })
  const out = validateSyntax(getFlags, raw)

  expect(out).toEqual([
    'Unexpected reference in yes (contains=dolphin)'
  ])
})

test('swapToRejectionBranch', done => {
  const raw = resolve([])
  const output = swapToRejectionBranch(raw)
  fork(done)(x => {
    expect(stripColor(x)).toEqual('Hooray, no errors!')
    done()
  })(output)
})

test('swapToRejectionBranch - failure', done => {
  const raw = resolve(['villian'])
  const output = swapToRejectionBranch(raw)
  fork(x => {
    expect(x).toEqual(['villian'])
    done()
  })(done)(output)
})

test('getArgs', () => {
  expect(getArgs(['--coverage'])).toEqual({ _: [], coverage: true })
})

const sideRun = curry((run, raw) => {
  run(raw)
  return raw
})
const snapshot = x => expect(x).toMatchSnapshot()

test('unfoldLeadingSlashes', () => {
  const raw = unfoldLeadingSlashes(['dope', 'nice'])
  expect(raw).toEqual(['dope', 'nice'])
  const raw2 = unfoldLeadingSlashes([
    'hello',
    'syntax keyword',
    '\\ dope',
    'nice'
  ])
  expect(raw2).toEqual(['hello', 'syntax keyword dope', 'nice'])
})

test('readSyntax', done => {
  const file = readFile(FIXTURE)
  fork(done)(
    pipe(
      split(C.n),
      sideRun(snapshot),
      unfoldLeadingSlashes,
      sideRun(snapshot),
      filter(startsWith('syntax')),
      sideRun(snapshot),
      filter(matchMatchKeywordOrRegionOnly),
      sideRun(snapshot),
      map(pipe(split(C._), filter(I), map(trim))),
      structurizeArrays,
      sideRun(snapshot),
      raw => {
        snapshot(raw)
        done()
      }
    )
  )(file)
})
test('structureData - else case', () => {
  expect(structureData(['yo', 'what', 'is', 'up'])).toEqual({
    is: true,
    up: true,
    what: true,
    yo: true
  })
})

test('swapNull', () => {
  expect(swapNull('')).toEqual('')
  expect(swapNull([''])).toEqual([])
  expect(swapNull('oh yeah')).toEqual(['oh yeah'])
  expect(swapNull(['nice'])).toEqual(['nice'])
})

test('stripAtSign', () => {
  expect(stripAtSign('@dope')).toEqual(stripAtSign('dope'))
})

test('skipSomeGlobals', () => {
  const noglobe = skipSomeGlobals('aa.bb.cc'.split('.'))
  expect(noglobe('aa.xx.yy.zz'.split('.'))).toEqual(
    'xx.yy.zz'.split('.')
  )
})

test('invalidRelativeToNames', () => {
  expect(
    invalidRelativeToNames(['jim', 'bob', 'steve'], ['@steve'])
  ).toEqual([])
})

test('solveValidity', () => {
  const names = ['alpha', 'beta', 'gamma', 'delta']
  const agg = []
  const x = {}
  expect(solveValidity(names, agg, x)).toEqual([{ valid: true }])
})

test('solveValidity - invalid', () => {
  const names = ['mama', 'gamma']
  const agg = [{ name: 'alpha', data: { contains: ['beta'] } }]
  const x = { name: 'i guess', data: { matchgroup: ['trace'] } }
  expect(solveValidity(names, agg, x)).toEqual([
    { data: { contains: ['beta'] }, name: 'alpha' },
    {
      data: { matchgroup: ['trace'] },
      expected: {
        contains: [],
        matchgroup: ['trace'],
        nextgroup: []
      },
      name: 'i guess',
      valid: false
    }
  ])
})

test('villianWithOptions', done => {
  const input = { _: [FIXTURE], validate: false }
  fork(done)(raw => {
    expect(raw).toMatchSnapshot()
    done()
  })(villianWithOptions(I, I, input))
})
