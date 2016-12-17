import $ from 'jquery';

import ImageStore from './imageStore';


const API_ENPOINT = 'http://picasso-tab.appspot.com/api/v1/image/batch/';

export default class ImageProvider {

  static async skipCurrentImage() {
    ImageStore.skipCurrentImage();
    return ImageProvider.getCurrentImage();
  }

  static async getCurrentImage() {
    await ImageProvider._expireImageAndExtendQueue();
    let currentImage = ImageStore.getCurrentImage();
    if (!ImageStore.isDownloaded(currentImage)) {
      currentImage = await ImageProvider._downloadImage(currentImage);
      ImageStore.updateCachedImage(0, currentImage);
    }
    ImageProvider.downloadNextImages();
    return currentImage;
  }

  static async downloadNextImages() {
    const imagesToDownload = ImageStore.getUncachedImages();
    for (let i = 0; i < imagesToDownload.length; i += 1) {
      const imageBucket = imagesToDownload[i];
      const downloadedImage = await ImageProvider._downloadImage(imageBucket.image);
      ImageStore.updateCachedImage(imageBucket.index, downloadedImage);
    }
  }

  static async _expireImageAndExtendQueue() {
    if (ImageStore.currentImageIsExpired()) {
      ImageStore.skipCurrentImage();
      ImageStore.refreshLastUpdated();
    }
    if (ImageStore.shouldExtendQueue()) {
      await ImageProvider._updateImageCache(ImageStore.getBatchIndex());
    }
  }

  static async _downloadImage(image, retry = false) {
    const dataUri = await ImageProvider._convertToDataUri(image.image);
    const annotatedImage = Object.assign({}, image, { dataUri });
    if (!ImageStore.canUpdateCachedImage(annotatedImage)) {
      if (retry) {
        throw new Error('Cannot set image');
      }
      annotatedImage.image += '!Large.jpg';
      return ImageProvider._downloadImage(annotatedImage, true);
    }
    return annotatedImage;
  }

  static async _convertToDataUri(imageUrl) {
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

  static async _updateImageCache(index) {
    const images = await ImageProvider._fetchImageBatch(index);
    ImageStore.addImages(images);
    ImageStore.setBatchIndex(index + images.length);
  }

  static async _fetchImageBatch(index) {
    const batchEndpoint = API_ENPOINT + index;
    return await $.get(batchEndpoint);
  }

  static _handleError(error) {
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
