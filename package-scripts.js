module.exports = {
  scripts: {
    validate: `./villian.js fixtures/madlib-broken.vim -v`,
    lint: `eslint src/*.js`,
    rollup: `rollup -c rollup.config.js`,
    build: `nps rollup && chmod 755 villian.js`,
    bundle: `nps build`,
    test: 'jest'
  }
}
