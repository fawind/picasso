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
    if (!ImageStore.hasCurrentImage() || ImageStore.currentImageIsExpired()) {
      await ImageProvider._updateCurrentImage();
    }
    const image = ImageStore.getCurrentImage();
    return image;
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
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(xhr.response);
      };
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
}
