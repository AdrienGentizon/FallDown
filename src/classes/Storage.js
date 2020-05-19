class Storage {
  constructor() {
    this._isEnabled = false;
    this._localStorageKey = 'fallDown';
    this.data = undefined;
    this.dataString = '';
    try {
      this.checkEnabled();
    } catch (error) {
      console.error(error);
    }
  }

  checkEnabled() {
    if (typeof Storage !== 'undefined') {
      this._isEnabled = true;
    } else {
      this._isEnabled = false;

      throw 'Sorry! No Web Storage support..';
    }
  }

  fetchData() {
    if (this._isEnabled) {
      console.dir(localStorage);
      if (localStorage[this._localStorageKey]) {
        console.dir(JSON.parse(localStorage.getItem(this._localStorageKey)).users);
      } else {
        console.debug('fallDown Storage not present');
        this.init();
      }
    } else {
      throw 'Sorry! No Web Storage support..';
    }
  }

  init() {
    this.data = { users: [] };
    this.dataString = JSON.stringify(this.data);
    console.log(this.dataString);

    localStorage.setItem(this._localStorageKey, this.dataString);
  }

  clear() {
    localStorage.removeItem(this._localStorageKey);
  }
}

module.exports = Storage;
