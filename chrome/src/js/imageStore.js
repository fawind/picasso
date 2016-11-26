const KEYS = {
  IMAGES: 'images',
  CURRENT_IMAGE: 'current_image',
  INDEX: 'index',
  LAST_UPDATED: 'last_updated',
};

class Store {

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

export default class ImageStore {

  static getIndex() {
    return Store.get(KEYS.INDEX) || 0;
  }

  static setIndex(index) {
    Store.set(KEYS.INDEX, index);
  }

  static getCurrentImage() {
    return Store.get(KEYS.CURRENT_IMAGE) || null;
  }

  static setCurrentImage(image) {
    Store.set(KEYS.CURRENT_IMAGE, image);
  }

  static hasCurrentImage() {
    return ImageStore.getCurrentImage() !== null;
  }

  static currentImageIsExpired() {
    return ImageStore.getLastUpdated() !== ImageStore._getDay();
  }

  static getLastUpdated() {
    return Store.get(KEYS.LAST_UPDATED) || -1;
  }

  static refreshLastUpdated() {
    Store.set(KEYS.LAST_UPDATED, ImageStore._getDay());
  }

  static expireCurrentImage() {
    Store.set(KEYS.LAST_UPDATED, -1);
  }

  static getImagesCount() {
    return ImageStore.getImages().length;
  }

  static getImages() {
    return Store.get(KEYS.IMAGES) || [];
  }

  static setImages(images) {
    return Store.set(KEYS.IMAGES, images);
  }

  static addImages(images) {
    const currentImages = ImageStore.getImages();
    Store.set(KEYS.IMAGES, currentImages.concat(images));
  }

  static _getDay() {
    return new Date().getDate();
  }

  static _clear() {
    Store.set(KEYS.IMAGES, '');
    Store.set(KEYS.CURRENTIMAGE, '');
    Store.set(KEYS.LAST_UPDATED, '');
  }
}
