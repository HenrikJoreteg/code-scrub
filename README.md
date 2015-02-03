# code-scrub

JS module code formatter per [@HenrikJoreteg](http://twitter.com/henrikjoreteg)'s preferences.

Mainly for personal use, but sharing if someone wants to use it.

## install

cli usage:

```
$ npm install code-scrub -g
$ cat some.js | code-scrub

# can also pass options
$ cat some.js | code-scrub --indent=4

# or set options by creating `$HOME/.code-scrubrc` as a JSON (or INI) file with config options

# or if you're brave
$ code-scrub myfile.js

This will re-write the file in place with new style applied
```


api:

```js
var fs = require('fs');
var scrub = require('code-scrub');

// read in some code
var code = fs.readFileSync('my.js', 'utf8');

// available options and their defaults
var scrubbed = scrub(code, {
    indent: 4,       // indent amount
    useTabs: false,  // indent type
    quotes: '\'',    // prefer single or double quotes
    ecmaVersion: 6   // version of ecma to be ok with
});

console.log(scrubbed);
```

## credits

If you like this follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

## license

MIT

