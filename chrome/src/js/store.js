export default class Store {

  static set(key, value) {
    localStorage.setItem(key, this._serialize(value));
  }

  static get(key) {
    return this._deserialize(localStorage.getItem(key));
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
}
