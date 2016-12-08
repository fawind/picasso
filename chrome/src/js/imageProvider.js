import $ from 'jquery';

import ImageStore from './imageStore';


const API_ENPOINT = 'http://picasso-tab.appspot.com/api/v1/image/batch/';
const MIN_IMAGECACHE = 1;


export default class ImageProvider {

  static async skipCurrentImage() {
    ImageStore.expireCurrentImage();
    return await ImageProvider.getCurrentImage();
  }

  static async getCurrentImage() {
    try {
      if (!ImageStore.hasCurrentImage() || ImageStore.currentImageIsExpired()) {
        await ImageProvider._updateCurrentImage();
      }
      return ImageStore.getCurrentImage();
    } catch (error) {
      ImageProvider._handleError(error);
      throw error;
    }
  }

  static async _updateCurrentImage() {
    if (ImageStore.getImagesCount() <= MIN_IMAGECACHE) {
      await ImageProvider._updateImageCache(ImageStore.getIndex());
    }
    const images = ImageStore.getImages();
    let currentImage = images.shift();
    currentImage = await ImageProvider._downloadAndUpdateCurrentImage(currentImage);

    ImageStore.setImages(images);
    ImageStore.setCurrentImage(currentImage);
    ImageStore.refreshLastUpdated();
  }

  static async _downloadAndUpdateCurrentImage(image, retry = false) {
    const dataUri = await ImageProvider._convertToDataUri(image.image);
    const annotatedImage = Object.assign({}, image, { dataUri });
    try {
      ImageStore.setCurrentImage(annotatedImage);
    } catch (error) {
      // Data uri to large for store.
      if (retry) { throw error; }
      annotatedImage.image += '!Large.jpg';
      return ImageProvider._downloadAndUpdateCurrentImage(annotatedImage, true);
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
    ImageStore.setIndex(index + images.length);
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
