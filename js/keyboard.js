/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */
import * as storage from './storage.js';
import create from './create.js';
import language from './languages/index.js';
import Key from './keys.js';

const wrapper = create(
  'main',
  'wrapper',
  [create('h1', 'title', 'RSS Виртуальная клавиатура'),
    create('p', 'description', 'Клавиатура создана в операционной системе Ubuntu'),
    create('p', 'description', 'Для переключения языка - комбинация: <span>левыe</span> ctrl + alt')],
);

export default class Keyboard {
  constructor(rowsOfKeyboard) {
    this.rowsOfKeyboard = rowsOfKeyboard;
    this.keysDown = {};
    this.isCapsLock = false;
  }

  init(langCode) {
    this.arrOfKeys = language[langCode];
    storage.set('langAbbr', langCode);
    this.textarea = create('textarea', 'textarea', null, wrapper, ['rows', 5], ['cols', 50], ['spellcheck', false]);
    this.keyboard = create('div', 'keyboard', null, wrapper, ['language', langCode]);
    document.body.prepend(wrapper);
    return this;
  }

  textOutput() {
    this.keyButtons = [];
    this.rowsOfKeyboard.forEach((row, i) => {
      const rowKeyboard = create('div', 'keyboard__row', null, this.keyboard, ['row', i + 1]);

      row.forEach((code) => {
        const keyObj = this.arrOfKeys.find((key) => key.code === code);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowKeyboard.appendChild(keyButton.container);
        }
      });
    });
    document.addEventListener('keydown', this.clickHandler);
    document.addEventListener('keyup', this.clickHandler);
  }

  clickHandler = (ev) => {
    if (ev.stopPropagation) ev.stopPropagation();
    const { code, type } = ev;
    const keyObj = this.keyButtons.find((key) => key.code === code);

    if (!keyObj) return;
    this.textarea.focus();

    if (type.match(/keydown|mousedown/)) {
      if (type.match(/key/)) ev.preventDefault();
      keyObj.container.classList.add('active');

      if (code.match(/ControlLeft/)) this.ctrlKey = true;
      if (code.match(/AltLeft/)) this.altKey = true;

      if (code.match(/ControlLeft/) && this.altKey) this.languageСhange();
      if (code.match(/AltLeft/) && this.ctrlKey) this.languageСhange();
    } else if (type.match(/keyup|mouseup/)) {
      keyObj.container.classList.remove('active');

      if (code.match(/ControlLeft/)) this.ctrlKey = false;
      if (code.match(/AltLeft/)) this.altKey = false;
    }
  };

  languageСhange = () => {
    if (this.keyboard.dataset.language === 'ru') {
      this.keyboard.dataset.language = 'en';
      storage.set('langAbbr', 'en');
    } else if (this.keyboard.dataset.language === 'en') {
      this.keyboard.dataset.language = 'ru';
      storage.set('langAbbr', 'ru');
    }
  };
}
