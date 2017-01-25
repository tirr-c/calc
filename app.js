const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

const calculate = require('./lib/calc.js');

rl.setPrompt('> ');
rl.prompt();

rl.on('line', line => {
  try {
    const calc = calculate(line);

    calc.messages.forEach(i => console.log(i));
    console.log(calc.toString());
  } catch (e) {
    if ('err' in e) {
      console.log('오류:', e.err);
    } else {
      throw e;
    }
  }
  rl.prompt();
}).on('close', () => {
  process.exit(0);
});
