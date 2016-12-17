const KEYS = {
  TEMP_BUCKET: 'temp_bucket',
};

export default class Store {

  static set(key, value) {
    localStorage.setItem(key, Store._serialize(value));
  }

  static get(key) {
    return Store._deserialize(localStorage.getItem(key));
  }

  static canSet(value) {
    try {
      Store.set(KEYS.TEMP_BUCKET, value);
    } catch (error) {
      return false;
    }
    localStorage.removeItem(KEYS.TEMP_BUCKET);
    return true;
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static _serialize(value) {
    return JSON.stringify(value);
  }

  static _deserialize(value) {
    if (typeof value !== 'string') return undefined;
    try {
      return JSON.parse(value);
    } catch (_) {
      return value || undefined;
    }
  }

  static _getKeys() {
    return KEYS;
  }
}
