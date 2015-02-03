var acorn = require('acorn');
var escodegen = require('escodegen');
var repeat = require('repeat-string');
var defaults = require('amp-defaults');
var includes = require('amp-includes');
var tagRE = /<\/?(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;


module.exports = function (code, config) {
    config = defaults(config || {}, {
        indent: 4,
        useTabs: false,
        quotes: '\'',
        ecmaVersion: 6
    });

    // remove JSX
    var jsx = [];
    var lines = code.split('\n');
    var other = lines.map(function (line) {
        if (tagRE.exec(line)) {
            line = '// ' + line;
            jsx.push(line);
        }
        return line;
    });

    code = other.join('\n');

    var comments = [];
    var tokens = [];
    var ast = acorn.parse(code, {
        raw: true, 
        tokens: true, 
        ranges: true,
        onComment: comments, 
        onToken: tokens,
        locations: true,
        ecmaVersion: config.ecmaVersion
    });

    ast = escodegen.attachComments(ast, comments, tokens);
    code = escodegen.generate(ast, {
        comment: true,
        format: {
            indent: {
                style: config.useTabs ? '\t' : repeat(' ', config.indent),
                base: 0,
                adjustMultilineComment: true
            },
            quotes: config.quotes
        }
    });

    lines = code.split('\n');
    var done = false;
    var prev;
    var output = [];
    lines.forEach(function (line, index) {
        // insert JSX back
        if (jsx[0] && line.indexOf(jsx[0]) !== -1) {
            jsx.shift();
            line = line.replace(/\/\//, '');
        }

        if (done) {
            output.push(line);
            return output;
        }

        var firstChars = line.slice(0, 3);

        var curr = firstChars === 'var' || firstChars === 'let';
        if (!curr && prev) {
            output.push('', '');
            done = true;
        }
        prev = curr;

        output.push(line);
        return output;
    });

    return output.join('\n') + '\n';
};
