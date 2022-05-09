import create from './create.js';

export default class Key {
  constructor({ normal, shift, code }) {
    this.normal = normal;
    this.shift = shift;
    this.code = code;
    if (normal.match(/Tab|Caps|Shift|Ctrl|Win|Alt|Backspace|Del|Enter|arr/)) {
      this.isFunctional = true;
    } else this.isFunctional = false;

    if (shift && shift.match(/[^0-9A-Za-zА-Яа-я]/)) {
      this.sign = create('div', 'sign', shift);
    } else {
      this.sign = create('div', 'sign', '');
    }

    this.letter = create('div', 'letter', normal);
    this.container = create(
      'div',
      'keyboard__key',
      [this.sign, this.letter],
      null,
      ['code', code],
      this.isFunctional ? ['fnbut', 'true'] : ['fnbut', 'false'],
    );
  }
}
