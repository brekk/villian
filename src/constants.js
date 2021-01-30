export const CLI_CONFIG = {
  alias: {
    help: 'h',
    syntax: 's',
    validate: 'v',
    output: 'o'
  },
  boolean: ['help'],
  string: ['validate'],
  normalize: ['syntax']
}
export const GLOBAL_EXCLUDES = ['@Spell', 'TOP']
export const RELATIONSHIP_FIELDS = {
  matchgroup: 'matchgroup',
  nextgroup: 'nextgroup',
  contains: 'contains'
}

export const HELPTEXT = `
      (\`-')  _                        _     (\`-')  _ <-. (\`-')_
     _(OO ) (_)      <-.      <-.    (_)    (OO ).-/    \\( OO) )
,--.(_/,-.\\ ,-(\`-'),--. )   ,--. )   ,-(\`-')/ ,---.  ,--./ ,--/
\\   \\ / (_/ | ( OO)|  (\`-') |  (\`-') | ( OO)| \\ /\`.\\ |   \\ |  |
 \\   /   /  |  |  )|  |OO ) |  |OO ) |  |  )'-'|_.' ||  . '|  |)
_ \\     /_)(|  |_/(|  '__ |(|  '__ |(|  |_/(|  .-.  ||  |\\    |
\\-'\\   /    |  |'->|     |' |     |' |  |'->|  | |  ||  | \\   |
    \`-'     \`--'   \`-----'  \`-----'  \`--'   \`--' \`--'\`--'  \`--'

# villian
## JS tools for vim-based fools

### process a vim syntax file!

villian syntax/madlib.vim

### validate a vim syntax file!

villian syntax/madlib.vim --validate

### validate a vim syntax file with a filter!

villian syntax/madlib.vim --validate madTypeSig

`
