export default class Store {

  constructor(store = localStorage) {
    this.store = store;
    this._keys = {
      TEMP_BUCKET: 'temp_bucket',
    };
  }

  set(key, value) {
    this.store.setItem(key, this._serialize(value));
  }

  get(key) {
    return this._deserialize(this.store.getItem(key));
  }

  canSet(value) {
    try {
      this.set(this._keys.TEMP_BUCKET, value);
    } catch (error) {
      return false;
    }
    this.store.removeItem(this._keys.TEMP_BUCKET);
    return true;
  }

  remove(key) {
    this.store.removeItem(key);
  }

  clear() {
    this.store.clear();
  }

  _serialize(value) {
    return JSON.stringify(value);
  }

  _deserialize(value) {
    if (typeof value !== 'string') return undefined;
    try {
      return JSON.parse(value);
    } catch (_) {
      return value || undefined;
    }
  }
}
