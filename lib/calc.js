const nearley = require('nearley');
const Decimal = require('decimal.js');
const Rational = require('../vendor/big-rational');
const grammar = require('../parser/expr.js');

const decZero = new Decimal(0);
const decOne = new Decimal(1);
const expThreshold = Rational('1e4');

function rationalToDecimal(rat) {
  return new Decimal(rat.num.toString()).div(rat.denom.toString());
}

function rationalToInteger(rat) {
  if (!rat.denom.isUnit()) return null;
  return rat.num.times(rat.denom);
}

function matchTypes(arr) {
  const firstDecimal = arr.find(item => item.tag === 'decimal');
  if (firstDecimal !== undefined) {
    // convert all rationals into decimals
    const dec = arr.map(item => {
      if (item.tag === 'decimal') return item.val;
      return rationalToDecimal(item.val);
    });
    // return a decimal
    return { tag: 'decimal', val: dec, err: firstDecimal.err };
  }
  return { tag: 'rational', val: arr.map(item => item.val) };
}

function calculateDecimalPow(base, exp, defaultErr) {
  const bothRational = base.tag === 'rational' && exp.tag === 'rational';
  const err = bothRational ?
    defaultErr :
    (exp.tag === 'decimal' ? exp.err : base.err);
  const baseDec = base.tag === 'rational' ? rationalToDecimal(base.val) : base.val;
  const expDec = exp.tag === 'rational' ? rationalToDecimal(exp.val) : exp.val;
  if (baseDec.isNeg()) {
    throw {
      err: '지수가 정수가 아닌데 밑이 음수입니다.'
    };
  }
  return { tag: 'decimal', val: baseDec.pow(expDec), err: err };
}

function calculate(obj, annotations) {
  switch (obj.type) {
    case 'rat':
      return { tag: 'rational', val: obj.val };
    case 'add': {
      const list = matchTypes(obj.list.map(i => calculate(i, annotations)));
      if (list.tag === 'decimal') {
        return { tag: 'decimal', val: list.val.reduce((l, a) => l.add(a), decZero), err: list.err };
      }
      return { tag: 'rational', val: list.val.reduce((l, a) => l.add(a), Rational.zero) };
    }
    case 'mul': {
      const list = matchTypes(obj.list.map(i => calculate(i, annotations)));
      if (list.tag === 'decimal') {
        return { tag: 'decimal', val: list.val.reduce((l, a) => l.times(a), decOne), err: list.err };
      }
      return { tag: 'rational', val: list.val.reduce((l, a) => l.times(a), Rational.one) };
    }
    case 'neg': {
      const calc = calculate(obj.val, annotations);
      if (calc.tag === 'decimal') return { tag: 'decimal', val: calc.val.neg(), err: calc.err };
      return { tag: 'rational', val: calc.val.negate() };
    }
    case 'inv': {
      const calc = calculate(obj.val, annotations);
      if (calc.val.isZero()) {
        throw {
          err: '0으로 나눌 수 없습니다.'
        };
      }
      if (calc.tag === 'decimal') return { tag: 'decimal', val: decOne.div(calc.val), err: calc.err };
      return { tag: 'rational', val: calc.val.reciprocate() };
    }
    case 'exp': {
      const base = calculate(obj.base, annotations);
      const exp = calculate(obj.exp, annotations);

      const expInt = exp.tag === 'rational' ? rationalToInteger(exp.val) : null;
      if (base.tag === 'decimal' || exp.tag === 'decimal' || expInt === null) {
        const err = `${base.val.toString()}의 ${exp.val.toString()}제곱: 지수가 정수가 아니면 결과가 부정확할 수 있습니다.`;
        if (annotations.accurate) {
          throw {
            err: err
          };
        }
        return calculateDecimalPow(base, exp, err);
      }
      if (exp.val.geq(expThreshold)) {
        const err = `${base.val.toString()}의 ${exp.val.toString()}제곱: 지수가 매우 크므로 부정확한 연산을 시도합니다.`;
        if (annotations.accurate) {
          throw {
            err: `${base.val.toString()}의 ${exp.val.toString()}제곱: 지수가 크면 정확한 연산에 시간이 오래 걸립니다.`
          };
        }
        return calculateDecimalPow(base, exp, err);
      }
      if (base.val.isZero() && (exp.val.isZero() || exp.val.isNegative())) {
        throw {
          err: '0은 양수 제곱만 할 수 있습니다.'
        };
      }
      return { tag: 'rational', val: base.val.pow(expInt) };
    }
  }
}

function valToString() {
  if (this.value.tag === 'decimal') {
    return this.value.val.toString();
  }
  return this.value.val.toDecimal(10);
}

function parseAnnotations(annotations) {
  const result = {
    accurate: false,
    precision: 20,
    printDecimal: false
  };
  const len = annotations.length;
  for (var i = 0; i < len; i++) {
    switch (annotations[i].name) {
      case 'accurate': result.accurate = true; break;
      case 'precision': result.precision = annotations[i].val; break;
      case 'print-decimal': result.printDecimal = true; break;
      default: break;
    }
  }
  return result;
}

function forceDecimal(val) {
  if (val.tag === 'decimal') return val;
  return { tag: 'decimal', val: rationalToDecimal(val.val) };
}

function calculateExpression(expr) {
  const parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  try {
    parser.feed(expr);
  } catch (e) {
    throw {
      err: `위치 ${e.offset}에서 파싱 에러`
    };
  }

  const messages = [];
  if (parser.results.length > 1) {
    messages.push('경고: 입력이 모호합니다. 가능한 해석 중 하나를 선택합니다.');
  }
  const parsedResult = parser.results[0];
  const parsedAnnot = parseAnnotations(parsedResult.annotations);
  const precision = parsedAnnot.precision;
  if (precision < 1 || precision > 1e9) {
    throw {
      err: '정밀도는 1 이상 1e9 이하여야 합니다.'
    }
  }
  Decimal.set({precision: precision});
  const calc = calculate(parsedResult.expression, parsedAnnot);
  if ('err' in calc) {
    messages.push(calc.err);
  }
  return {
    succeeded: true,
    messages: messages,
    value: parsedAnnot.printDecimal ? forceDecimal(calc) : calc,
    toString: valToString
  };
}

module.exports = calculateExpression;
