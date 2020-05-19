class Storage {
  constructor() {
    this._isEnabled = false;
    this._localStorageKey = 'fallDown';
    this.data = undefined;
    this.dataString = '';
    try {
      this.checkEnabled();
      this.init();
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

  checkUserNameFormat(userName) {
    const pattern = /^[a-z]{3}$/i;
    return pattern.test(userName);
  }

  clear() {
    localStorage.removeItem(this._localStorageKey);
  }

  fetchData() {
    if (this._isEnabled) {
      if (localStorage[this._localStorageKey]) {
      } else {
        console.debug('fallDown Storage not present');
        this.init();
      }
    } else {
      throw 'Sorry! No Web Storage support..';
    }
  }

  getUser(name) {
    if (this.data.users[name]) {
      return this.data.users.name;
    } else {
      console.debug('Unknown user.');
      return undefined;
    }
  }

  init() {
    this.data = { users: {} };
    this.dataString = JSON.stringify(this.data);

    localStorage.setItem(this._localStorageKey, this.dataString);
    console.info('STORAGE INITIALIZED');
  }

  setUser(name, key, value) {
    if (this.data.users[name]) {
      console.debug('Updating user.');
    } else {
      console.debug('Creating user.');
      const user = {};
      user[key] = value;
      console.log(user);

      this.data.users[name] = user;
      console.log(this.data);
    }
  }
}

module.exports = Storage;
