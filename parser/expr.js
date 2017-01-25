// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }
 var Rational = require('../vendor/big-rational'); var grammar = {
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["wschar", "_$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["wschar", "__$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "main$ebnf$1", "symbols": []},
    {"name": "main$ebnf$1", "symbols": ["Annotation", "main$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "main", "symbols": ["_", "main$ebnf$1", "AddSub", "_"], "postprocess": function(d) { return { annotations: d[1], expression: d[2] }; }},
    {"name": "Annotation$string$1", "symbols": [{"literal":"a"}, {"literal":"c"}, {"literal":"c"}, {"literal":"u"}, {"literal":"r"}, {"literal":"a"}, {"literal":"t"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Annotation", "symbols": ["Annotation$string$1", "__"], "postprocess": function(d) { return { name: 'accurate' }; }},
    {"name": "Annotation$string$2", "symbols": [{"literal":"p"}, {"literal":"r"}, {"literal":"e"}, {"literal":"c"}, {"literal":"i"}, {"literal":"s"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Annotation", "symbols": ["Annotation$string$2", "__", "int", "__"], "postprocess": function(d) { return { name: 'precision', val: parseInt(d[2]) }; }},
    {"name": "Annotation$string$3", "symbols": [{"literal":"p"}, {"literal":"r"}, {"literal":"i"}, {"literal":"n"}, {"literal":"t"}, {"literal":"-"}, {"literal":"d"}, {"literal":"e"}, {"literal":"c"}, {"literal":"i"}, {"literal":"m"}, {"literal":"a"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Annotation", "symbols": ["Annotation$string$3", "__"], "postprocess": function(d) { return { name: 'print-decimal' }; }},
    {"name": "Parens", "symbols": [{"literal":"("}, "_", "AddSub", "_", {"literal":")"}], "postprocess": function(d) { return d[2]; }},
    {"name": "Parens", "symbols": ["Number"], "postprocess": id},
    {"name": "Exps", "symbols": ["Parens", "_", {"literal":"^"}, "_", "Exps"], "postprocess": function(d) { return { type: 'exp', base: d[0], exp: d[4] }; }},
    {"name": "Exps", "symbols": ["Parens"], "postprocess": id},
    {"name": "MulDiv", "symbols": ["MulDiv", "_", {"literal":"*"}, "_", "Exps"], "postprocess":  function(d) {
          if (d[0].type !== 'mul') {
            return {
              type: 'mul',
              list: [ d[0], d[4] ]
            };
          }
          return { type: 'mul', list: d[0].list.concat(d[4]) };
        } },
    {"name": "MulDiv", "symbols": ["MulDiv", "_", {"literal":"/"}, "_", "Exps"], "postprocess":  function(d) {
          var inv = { type: 'inv', val: d[4] };
          if (d[0].type !== 'mul') {
            return {
              type: 'mul',
              list: [ d[0], inv ]
            };
          }
          return { type: 'mul', list: d[0].list.concat(inv) };
        } },
    {"name": "MulDiv", "symbols": [{"literal":"-"}, "MulDiv"], "postprocess": function(d) { return { type: 'neg', val: d[1] }; }},
    {"name": "MulDiv", "symbols": [{"literal":"+"}, "MulDiv"], "postprocess": function(d) { return d[1]; }},
    {"name": "MulDiv", "symbols": ["Exps"], "postprocess": id},
    {"name": "AddSub", "symbols": ["AddSub", "_", {"literal":"+"}, "_", "Exps"], "postprocess":  function(d) {
          if (d[0].type !== 'add') {
            return {
              type: 'add',
              list: [ d[0], d[4] ]
            };
          }
          return { type: 'add', list: d[0].list.concat(d[4]) };
        } },
    {"name": "AddSub", "symbols": ["AddSub", "_", {"literal":"-"}, "_", "Exps"], "postprocess":  function(d) {
          var neg = { type: 'neg', val: d[4] };
          if (d[0].type !== 'add') {
            return {
              type: 'add',
              list: [ d[0], neg ]
            };
          }
          return { type: 'add', list: d[0].list.concat(neg) };
        } },
    {"name": "AddSub", "symbols": ["MulDiv"], "postprocess": id},
    {"name": "Number", "symbols": ["dec"], "postprocess": function(d) { return { type: 'rat', val: Rational(d[0]) }; }},
    {"name": "Number", "symbols": ["hex"], "postprocess": function(d) { return { type: 'rat', val: Rational(d[0]) }; }},
    {"name": "Number", "symbols": ["oct"], "postprocess": function(d) { return { type: 'rat', val: Rational(d[0]) }; }},
    {"name": "Number", "symbols": ["bin"], "postprocess": function(d) { return { type: 'rat', val: Rational(d[0]) }; }},
    {"name": "dec", "symbols": ["dec", /[eE]/, "int"], "postprocess": function(d) { return d[0] + 'e' + d[2]; }},
    {"name": "dec", "symbols": ["dec", /[eE]/, /[+-]/, "int"], "postprocess": function(d) { return d[0] + 'e' + d[2] + d[3]; }},
    {"name": "dec", "symbols": ["int", {"literal":"."}, "int"], "postprocess": function(d) { return d[0] + '.' + d[2]; }},
    {"name": "dec", "symbols": ["int"], "postprocess": id},
    {"name": "int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$1", "symbols": [/[0-9]/, "int$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "int", "symbols": ["int$ebnf$1"], "postprocess": function(d) { return d[0].join(''); }},
    {"name": "hex$ebnf$1", "symbols": [/[0-9a-fA-F]/]},
    {"name": "hex$ebnf$1", "symbols": [/[0-9a-fA-F]/, "hex$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "hex", "symbols": [{"literal":"0"}, /[xX]/, "hex$ebnf$1"], "postprocess": function(d) { return "0x" + d[2].join(''); }},
    {"name": "oct$ebnf$1", "symbols": [/[0-7]/]},
    {"name": "oct$ebnf$1", "symbols": [/[0-7]/, "oct$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "oct", "symbols": [{"literal":"0"}, /[oO]/, "oct$ebnf$1"], "postprocess": function(d) { return "0o" + d[2].join(''); }},
    {"name": "bin$ebnf$1", "symbols": [/[01]/]},
    {"name": "bin$ebnf$1", "symbols": [/[01]/, "bin$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "bin", "symbols": [{"literal":"0"}, /[bB]/, "bin$ebnf$1"], "postprocess": function(d) { return "0b" + d[2].join(''); }}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
