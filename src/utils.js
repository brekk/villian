import kleur from 'kleur'
import { complextrace } from 'envtrace'
import yargsParser from 'yargs-parser'
import {
  C,
  ap,
  applySpec,
  chain,
  concat,
  curry,
  equals,
  filter,
  fork,
  head,
  is,
  identity as I,
  ifElse,
  init,
  j2,
  join,
  keys,
  last,
  length,
  lt,
  map,
  mergeRight,
  nth,
  of,
  path,
  pathOr,
  pipe,
  prop,
  propEq,
  readFile,
  reduce,
  reject,
  replace,
  split,
  startsWith,
  toPairs,
  trim,
  uniq,
  without
} from 'snang/script'
import { reject as rejectFuture, resolve } from 'fluture'
import {
  RELATIONSHIP_FIELDS,
  GLOBAL_EXCLUDES,
  CLI_CONFIG,
  HELPTEXT
} from './constants'
export const getArgs = (
  /* istanbul ignore next */
  args = process.argv.slice(2)
) => yargsParser(args, CLI_CONFIG)

export const indexedArray = curry((y, x) => [x, y])
const [mArr, nArr, cArr] = map(
  indexedArray,
  keys(RELATIONSHIP_FIELDS)
)

export const convertDataToErrors = reduce((a, [def, expected]) => {
  const c = pipe(
    reject(([name]) => GLOBAL_EXCLUDES.includes(name)),
    map(
      ([name, cause]) =>
        `Unexpected reference in ${def} (${cause}=${name})`
    )
  )(expected)
  return a.concat(c)
}, [])

export const concatenateCauses = ([
  k,
  { contains, nextgroup, matchgroup }
]) => [
  k,
  pipe(
    map(cArr),
    concat(map(nArr, nextgroup)),
    concat(map(mArr, matchgroup))
  )(contains)
]

export const filterRelativeToStdIn = curry((getFlags, zzz) => {
  const input = prop('validate')(getFlags())
  return input ? filter(([def]) => def === input)(zzz) : zzz
})

export const validateSyntax = curry((getFlags, zzz) =>
  pipe(
    JSON.parse,
    prop('syntaxes'),
    filter(propEq('valid', false)),
    map(
      pipe(
        of,
        ap([prop('name'), prop('expected')]),
        concatenateCauses
      )
    ),
    filterRelativeToStdIn(getFlags),
    convertDataToErrors
  )(zzz)
)

export const swapToRejectionBranch = chain(raw =>
  ifElse(
    pipe(length, equals(0)),
    () => resolve(kleur.green('Hooray, no errors!')),
    rejectFuture
  )(raw)
)

export const validate = pipe(
  map(validateSyntax(getArgs)),
  swapToRejectionBranch
)
export const log = complextrace('villian', [
  'structure',
  'structureDetail',
  'relationships',
  'relationshipsDetail',
  'names',
  'namesDetail',
  'validation',
  'validationDetail'
])

export const structureData = pipe(
  log.structure('input'),
  map(datapoint => {
    const [k, v] = datapoint.split('=')
    if (
      (~k.indexOf('/') ||
        ~k.indexOf('+') ||
        ~k.indexOf('\\') ||
        ['String', 'Boolean', 'Number', 'List'].includes(k)) &&
      !v
    ) {
      return { pattern: k }
    }
    return {
      [k]:
        typeof v === 'string' && ~v.indexOf(',')
          ? v.split(',')
          : !v
          ? true
          : v
    }
  }),
  log.structureDetail('mapped'),
  reduce(mergeRight, {}),
  log.structure('output')
)
export const swapNull = x =>
  x && typeof x === 'string' ? [x] : x[0] === '' ? [] : x

export const getRelationalData = pipe(
  log.relationships('input'),
  applySpec({
    contains: pathOr([], ['data', RELATIONSHIP_FIELDS.contains]),
    nextgroup: pathOr([], ['data', RELATIONSHIP_FIELDS.nextgroup]),
    matchgroup: pathOr([], ['data', RELATIONSHIP_FIELDS.matchgroup])
  }),
  log.relationshipsDetail('applied spec'),
  map(pipe(swapNull)),
  log.relationships('output')
)

export const stripAtSign = z => (z[0] === '@' ? z.substr(1) : z)

export const skipSomeGlobals = curry((expected, z) =>
  reject(zz => expected.includes(zz), z)
)
export const skipGlobals = skipSomeGlobals(GLOBAL_EXCLUDES)

export const getAllNames = pipe(
  log.names('input'),
  map(
    pipe(
      of,
      ap([
        prop('name'),
        path(['data', RELATIONSHIP_FIELDS.matchgroup])
      ])
    )
  ),
  log.namesDetail('transformed'),
  reduce(concat, []),
  filter(I),
  uniq,
  log.names('output')
)
export const invalidRelativeToNames = curry((names, match) =>
  ifElse(
    pipe(length, lt(0)),
    pipe(skipGlobals, map(stripAtSign), without(names)),
    () => []
  )(match)
)

const cumulativeLength = pipe(
  toPairs,
  reduce((w, [, v]) => w + v.length, 0)
)
export const solveValidity = curry((names, agg, x) => {
  log.validation('input', { names, agg, x })
  const { contains, nextgroup, matchgroup } = getRelationalData(x)
  const invalid = invalidRelativeToNames(names)
  const matched = map(invalid, { contains, nextgroup, matchgroup })
  const expected = map(filter(I), matched)
  log.validationDetail('matched', expected)
  const valid = cumulativeLength(expected) === 0
  const y = {
    ...x,
    valid
  }
  log.validation('output singular', y)
  return valid ? agg.concat(y) : agg.concat({ ...y, expected })
})

export const unsliceLine = pipe(
  trim,
  split(C.n),
  map(pipe(trim, replace(/^\\/, ''), trim)),
  join(C._),
  trim
)

export const unfoldLeadingSlashes = reduce((list, b) => {
  if (!b.trim().startsWith('\\')) {
    return list.concat(b)
  }
  const cleaned = unsliceLine(b)
  const prev = last(list)
  // const priorMatch =
  // prev && list.length > 2 && prev.startsWith('syntax')
  return init(list).concat(prev + ' ' + cleaned)
}, [])

export const matchMatchKeywordOrRegionOnly = pipe(
  split(C._),
  map(trim),
  nth(1),
  raw => ['match', 'keyword', 'region'].includes(raw)
)

export const structurizeArrays = map(([, kind, name, ...data]) => ({
  kind,
  name,
  raw: data,
  data: structureData(data)
}))

export const readSyntax = pipe(
  readFile,
  map(
    pipe(
      split(C.n),
      unfoldLeadingSlashes,
      filter(startsWith('syntax')),
      filter(matchMatchKeywordOrRegionOnly),
      map(pipe(split(C._), filter(I), map(trim))),
      structurizeArrays,
      all => {
        const names = getAllNames(all)
        return {
          entities: names,
          syntaxes: reduce(solveValidity(names), all, all)
        }
      },
      j2
    )
  )
)
/* istanbul ignore next */
export const handleErrorCase = fork(err => {
  console.error(
    kleur.red(`Found ${err.length} invalid relationships:`)
  )
  console.error(err)
  process.exit(1)
})(raw => {
  console.log(raw)
  process.exit(0)
})

const handleSuccessCase = fork(console.error)(console.log)

export const villianWithOptions = curry(
  (bad, good, { _: raw, validate: doValidate, help }) =>
    pipe(
      ifElse(
        () => help,
        () => console.log(HELPTEXT),
        pipe(
          head,
          readSyntax,
          ifElse(
            () => is(String, doValidate),
            pipe(validate, bad),
            good
          )
        )
      )
    )(raw)
)

export const villian = villianWithOptions(
  handleErrorCase,
  handleSuccessCase
)
