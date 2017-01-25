@{% var Rational = require('../vendor/big-rational'); %}

@builtin "whitespace.ne"

main -> _ Annotation:* AddSub _ {% function(d) { return { annotations: d[1], expression: d[2] }; } %}

Annotation -> "accurate" __         {% function(d) { return { name: 'accurate' }; } %}
            | "precision" __ int __ {% function(d) { return { name: 'precision', val: parseInt(d[2]) }; } %}
            | "print-decimal" __    {% function(d) { return { name: 'print-decimal' }; } %}

Parens -> "(" _ AddSub _ ")" {% function(d) { return d[2]; } %}
        | Number             {% id %}

Exps -> Parens _ "^" _ Exps {% function(d) { return { type: 'exp', base: d[0], exp: d[4] }; } %}
      | Parens              {% id %}

MulDiv -> MulDiv _ "*" _ Exps {% function(d) {
                                   if (d[0].type !== 'mul') {
                                     return {
                                       type: 'mul',
                                       list: [ d[0], d[4] ]
                                     };
                                   }
                                   return { type: 'mul', list: d[0].list.concat(d[4]) };
                                 } %}
        | MulDiv _ "/" _ Exps {% function(d) {
                                   var inv = { type: 'inv', val: d[4] };
                                   if (d[0].type !== 'mul') {
                                     return {
                                       type: 'mul',
                                       list: [ d[0], inv ]
                                     };
                                   }
                                   return { type: 'mul', list: d[0].list.concat(inv) };
                                 } %}
        | "-" MulDiv          {% function(d) { return { type: 'neg', val: d[1] }; } %}
        | "+" MulDiv          {% function(d) { return d[1]; } %}
        | Exps                {% id %}

AddSub -> AddSub _ "+" _ Exps {% function(d) {
                                   if (d[0].type !== 'add') {
                                     return {
                                       type: 'add',
                                       list: [ d[0], d[4] ]
                                     };
                                   }
                                   return { type: 'add', list: d[0].list.concat(d[4]) };
                                 } %}
        | AddSub _ "-" _ Exps {% function(d) {
                                   var neg = { type: 'neg', val: d[4] };
                                   if (d[0].type !== 'add') {
                                     return {
                                       type: 'add',
                                       list: [ d[0], neg ]
                                     };
                                   }
                                   return { type: 'add', list: d[0].list.concat(neg) };
                                 } %}
        | MulDiv              {% id %}

Number -> dec {% function(d) { return { type: 'rat', val: Rational(d[0]) }; } %}
        | hex {% function(d) { return { type: 'rat', val: Rational(d[0]) }; } %}
        | oct {% function(d) { return { type: 'rat', val: Rational(d[0]) }; } %}
        | bin {% function(d) { return { type: 'rat', val: Rational(d[0]) }; } %}

dec -> dec [eE] int      {% function(d) { return d[0] + 'e' + d[2]; } %}
     | dec [eE] [+-] int {% function(d) { return d[0] + 'e' + d[2] + d[3]; } %}
     | int "." int       {% function(d) { return d[0] + '.' + d[2]; } %}
     | int               {% id %}

int -> [0-9]:+                {% function(d) { return d[0].join(''); } %}
hex -> "0" [xX] [0-9a-fA-F]:+ {% function(d) { return "0x" + d[2].join(''); } %}
oct -> "0" [oO] [0-7]:+       {% function(d) { return "0o" + d[2].join(''); } %}
bin -> "0" [bB] [01]:+        {% function(d) { return "0b" + d[2].join(''); } %}
