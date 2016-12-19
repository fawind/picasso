import ImageStore from './imageStore';


export default class ImageProvider {

  static constitute() { return [ImageStore]; }

  constructor(imageStore) {
    this.imageStore = imageStore;
    this._API_ENPOINT = 'http://picasso-tab.appspot.com/api/v1/image/batch/';
  }

  async skipCurrentImage() {
    this.imageStore.skipCurrentImage();
    return this.getCurrentImage();
  }

  async getCurrentImage() {
    await this._expireImageAndExtendQueue();
    let currentImage = this.imageStore.getCurrentImage();
    if (!this.imageStore.isDownloaded(currentImage)) {
      currentImage = await this._downloadImage(currentImage);
      this.imageStore.updateCachedImage(0, currentImage);
    }
    this.downloadNextImages();
    return currentImage;
  }

  async downloadNextImages() {
    const imagesToDownload = this.imageStore.getUncachedImages();
    for (let i = 0; i < imagesToDownload.length; i += 1) {
      const imageBucket = imagesToDownload[i];
      const downloadedImage = await this._downloadImage(imageBucket.image);
      this.imageStore.updateCachedImage(imageBucket.index, downloadedImage);
    }
  }

  async _expireImageAndExtendQueue() {
    if (this.imageStore.currentImageIsExpired()) {
      this.imageStore.skipCurrentImage();
      this.imageStore.refreshLastUpdated();
    }
    if (this.imageStore.shouldExtendQueue()) {
      await this._updateImageCache(this.imageStore.getBatchIndex());
    }
  }

  async _downloadImage(image, retry = false) {
    const dataUri = await this._convertToDataUri(image.image);
    const annotatedImage = Object.assign({}, image, { dataUri });
    if (!this.imageStore.canUpdateCachedImage(annotatedImage)) {
      if (retry) {
        throw new Error('Cannot set image');
      }
      annotatedImage.image += '!Large.jpg';
      return this._downloadImage(annotatedImage, true);
    }
    return annotatedImage;
  }

  async _convertToDataUri(imageUrl) {
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status !== 200) {
          reject(`Error while downloading image: ${xhr.status}: ${xhr.statusText}`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = () => reject(`Error while downloading image: ${xhr.status}: ${xhr.statusText}`);
      xhr.open('GET', imageUrl);
      xhr.send();
    });
  }

  async _updateImageCache(index) {
    const images = await this._fetchImageBatch(index);
    this.imageStore.addImages(images);
    this.imageStore.setBatchIndex(index + images.length);
  }

  async _fetchImageBatch(index) {
    const batchEndpoint = this._API_ENPOINT + index;
    return await fetch(batchEndpoint)
      .then(response => response.json());
  }

  _handleError(error) {
    const ISSUES_URL = 'https://github.com/fawind/picasso/issues';
    // eslint-disable-next-line no-console
    console.error(
      'Error while loading background image. Please check that you are connected with the internet and try again.',
      `If the error persists, please open a ticket: ${ISSUES_URL}`,
    );
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
