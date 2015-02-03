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
    var firstDone = false;
    var prev;
    var output = [];
    lines.forEach(function (line, index) {
        // insert JSX back
        if (jsx[0] && line.indexOf(jsx[0]) !== -1) {
            jsx.shift();
            line = line.replace(/\/\//, '');
        }

        var firstChars = line.trim().slice(0, 3);
        var curr = {
            isVar: (firstChars === 'var' || firstChars === 'let'),
            indent: getIndent(line),
            isComment: (firstChars === '// ' || firstChars === '*/')
        };
        
        // fix odd bug where we sometimes
        // get an indent of 1 for unknown reason
        if (curr.indent === 1) {
            curr.indent = 0;
            line = line.trim();
        }

        var sameIndent = (prev && prev.indent === curr.indent);
        var sameType = (curr.isComment && prev.isComment) || (curr.isVar && prev && prev.isVar)
        var shouldAddNewLine = false;

        // add new line if new var statements or comment section
        if (firstDone && sameIndent && !sameType && (curr.isComment || curr.isVar)) {        
            output.push('');
        }

        if (!curr.isVar && prev && prev.isVar) {
            // add extra line for initial declarations
            if (!firstDone) {
                output.push('', '');
                firstDone = true;
                console.log('trimming', line);
            }
        }
        prev = curr;

        output.push(line);
        return output;
    });

    return output.join('\n') + '\n';
};


function getIndent(str) {
    var res = /^\s*/.exec(str);
    if (res && res[0]) {
        return res[0].length;
    }
    return 0;
}
