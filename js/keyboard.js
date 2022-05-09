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
    this.keyboard.onmousedown = this.mouseEvent;
    this.keyboard.onmouseup = this.mouseEvent;
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
      if (code.match(/Shift/)) this.isShift = true;
      if (this.isShift) this.changeUpCase(true);

      if (code.match(/Caps/) && !this.isCapsLock) {
        this.isCapsLock = true;
        this.changeUpCase(true);
      } else if (code.match(/Caps/) && this.isCapsLock) {
        this.isCapsLock = false;
        this.changeUpCase(false);
        keyObj.container.classList.remove('active');
      }

      if (code.match(/ControlLeft/)) this.ctrlKey = true;
      if (code.match(/AltLeft/)) this.altKey = true;

      if (code.match(/ControlLeft/) && this.altKey) this.languageСhange();
      if (code.match(/AltLeft/) && this.ctrlKey) this.languageСhange();

      if (!this.isCapsLock) {
        this.outputOfTextarea(keyObj, this.isShift ? keyObj.shift : keyObj.normal);
      } else if (this.isCapsLock) {
        if (this.isShift) {
          this.outputOfTextarea(keyObj, keyObj.sign.innerHTML ? keyObj.shift : keyObj.normal);
        } else {
          this.outputOfTextarea(keyObj, !keyObj.sign.innerHTML ? keyObj.shift : keyObj.normal);
        }
      }
    } else if (type.match(/keyup|mouseup/)) {
      if (!code.match(/Caps/)) keyObj.container.classList.remove('active');

      if (code.match(/ControlLeft/)) this.ctrlKey = false;
      if (code.match(/AltLeft/)) this.altKey = false;
      if (code.match(/Shift/)) {
        this.isShift = false;
        this.changeUpCase(false);
      }
    }
  };

  languageСhange = () => {
    if (this.keyboard.dataset.language === 'ru') {
      this.keyboard.dataset.language = 'en';
      this.arrOfKeys = language.en;
      storage.set('langAbbr', 'en');
    } else if (this.keyboard.dataset.language === 'en') {
      this.keyboard.dataset.language = 'ru';
      this.arrOfKeys = language.ru;
      storage.set('langAbbr', 'ru');
    }

    this.keyButtons.forEach((findKey) => {
      const keyObj = this.arrOfKeys.find((key) => key.code === findKey.code);
      if (!keyObj) return;
      findKey.normal = keyObj.normal;
      findKey.shift = keyObj.shift;
      if (keyObj.shift && keyObj.shift.match(/[^0-9A-Za-zА-ЯёЁа-я]/g)) {
        findKey.sign.innerHTML = keyObj.shift;
      } else {
        findKey.sign.innerHTML = '';
      }
      findKey.letter.innerHTML = keyObj.normal;
    });

    if (this.isCapsLock) this.changeUpCase(true);
  };

  changeUpCase(isFlag) {
    if (isFlag) {
      this.keyButtons.forEach((key) => {
        if (key.sign.innerHTML) {
          if (this.isShift) {
            key.sign.classList.add('sign-active');
            key.letter.classList.add('sign');
          }
        }

        if (!key.isFunctional && this.isCapsLock && !this.isShift && !key.sign.innerHTML) {
          key.letter.innerHTML = key.shift;
        } else if (!key.isFunctional && this.isCapsLock && this.isShift) {
          key.letter.innerHTML = key.normal;
        } else if (!key.isFunctional && !key.sign.innerHTML) {
          key.letter.innerHTML = key.shift;
        }
      });
    } else {
      this.keyButtons.forEach((key) => {
        if (key.sign.innerHTML && !key.isFunctional) {
          key.sign.classList.remove('sign-active');
          key.letter.classList.remove('sign');

          if (!this.isCapsLock) {
            key.letter.innerHTML = key.normal;
          } else if (this.isShift) {
            key.letter.innerHTML = key.shift;
          }
        } else if (!key.isFunctional) {
          if (this.isCapsLock) {
            key.letter.innerHTML = key.shift;
          } else {
            key.letter.innerHTML = key.normal;
          }
        }
      });
    }
  }

  outputOfTextarea(keyObj, charKey) {
    let posOfCursor = this.textarea.selectionStart;
    const leftFromCursor = this.textarea.value.slice(0, posOfCursor);
    const rigthFromCursor = this.textarea.value.slice(posOfCursor);
    const fnButHandler = {
      Enter: () => {
        this.textarea.value = `${leftFromCursor}\n${rigthFromCursor}`;
        posOfCursor += 1;
      },
      Backspace: () => {
        this.textarea.value = `${leftFromCursor.slice(0, -1)}${rigthFromCursor}`;
        posOfCursor -= 1;
      },
      Delete: () => {
        this.textarea.value = `${leftFromCursor}${rigthFromCursor.slice(1)}`;
      },
      Tab: () => {
        this.textarea.value = `${leftFromCursor}\t${rigthFromCursor}`;
        posOfCursor += 1;
      },
      ArrowLeft: () => {
        this.textarea.value = `${leftFromCursor}←${rigthFromCursor}`;
        posOfCursor += 1;
      },
      ArrowRight: () => {
        this.textarea.value = `${leftFromCursor}→${rigthFromCursor}`;
        posOfCursor += 1;
      },
      ArrowUp: () => {
        this.textarea.value = `${leftFromCursor}↑${rigthFromCursor}`;
        posOfCursor += 1;
      },
      ArrowDown: () => {
        this.textarea.value = `${leftFromCursor}↓${rigthFromCursor}`;
        posOfCursor += 1;
      },
    };
    if (fnButHandler[keyObj.code]) {
      fnButHandler[keyObj.code]();
    } else if (!keyObj.isFunctional) {
      posOfCursor += 1;
      this.textarea.value = `${leftFromCursor}${charKey || ''}${rigthFromCursor}`;
    }
    this.textarea.setSelectionRange(posOfCursor, posOfCursor);
  }
}
