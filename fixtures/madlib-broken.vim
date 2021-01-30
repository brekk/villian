if exists("b:current_syntax")
    finish
endif

let b:current_syntax = "madlib"

syntax sync fromstart
syntax case match

setlocal foldmethod=indent
setlocal foldignore=

syntax match madIdentifier "[_a-z][a-zA-z0-9_']*" contained

syntax match madTypeSig
           \   "^\s*\(where\s\+\|let\s\+\|default\s\+\)\?[_a-z][a-zA-Z0-9_']*#\?\(,\s*[_a-z][a-zA-Z0-9_']*#\?\)*\_s\+::\_s"
           \   contains=madWhere,madIdentifier,madOperators,madSeparator,madParens

syntax match   madOperators      "[-!#$%&\*\+/<=>\?@\\^|~:.]\+\|\<_\>"
highlight link madOperators      Operator

syntax keyword madData           data 
           \   nextgroup=madDataIdentifier
highlight link madData           Keyword

syntax match   madTypeVar        contained /\<\K\k\+/
           \   skipwhite
highlight link madTypeVar        Constant

syntax match   madDataIdentifier "\<[A-Z][a-zA-Z0-9_']*\>" 
           \   nextgroup=madTypeVar,madOperators,madParens
highlight link madDataIdentifier TypeDef

syntax keyword madFrom           contained from
           \   skipwhite skipempty 
           \   nextgroup=madString
highlight link madFrom           Keyword

syntax match   madModuleComma    contained /,/
           \   skipwhite skipempty 
           \   nextgroup=madModuleKeyword,madModuleAsterisk,madModuleGroup
highlight link madModuleComma    Noise

syntax match   madModuleAsterisk contained /\*/
           \   skipwhite skipempty 
           \   nextgroup=madModuleKeyword,madFrom
highlight link madModuleAsterisk Special

syntax match   madModuleKeyword  contained /\<\K\k*/
           \   skipwhite skipempty 
           \   nextgroup=madFrom,madModuleComma
highlight link madModuleKeyword  Keyword

syntax keyword madImport         import
           \   skipwhite skipempty 
           \   nextgroup=madModuleKeyword,madModuleGroup
highlight link madImport         Keyword

syntax match   madComment        "\v\/\/.*$"
highlight link madComment        Comment

syntax region  madString         start=/\v"/ skip=/\\./ end=/\v"/
highlight link madString         String

syntax match   madFunctionCall   /\<\K\k*\ze(/
highlight link madFunctionCall   Function

syntax region  madModuleGroup    contained start=/{/ end=/}/   
           \   skipwhite skipempty
           \   matchgroup=madModuleBraces
           \   contains=madModuleKeyword,madModuleComma,madModuleAs,madComment
           \   nextgroup=madFrom
           \   fold
syntax region  madParens         matchgroup=madDelimiter start="(" end=")" 
           \   contains=TOP,@madTypeSig,@Spell
syntax region  madBrackets       matchgroup=madDelimiter start="\[" end="]" 
           \   contains=TOP,@madTypeSig,@Spell
syntax region  madBlock          matchgroup=madDelimiter start="{" end="}" 
           \   contains=TOP,@Spell

syntax region  madFenceBounded   start='#-' end='-#'
highlight link madFenceBounded   Todo 
syntax region  madFenceUnbounded start='^#-' end='-#'
highlight link madFenceUnbounded Error
 
