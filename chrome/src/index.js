import constitute from 'constitute';
import {
  BgElement,
  WidgetElement,
  TitleElement,
  DescriptionElement,
  SkipElement,
  LoadingElement,
} from './js/domElements';

import Clock from './js/clock';
import ImageProvider from './js/imageProvider';

import './main.css';

class NewTab {

  static constitute() {
    return [
      Clock,
      ImageProvider,
      BgElement,
      TitleElement,
      WidgetElement,
      DescriptionElement,
      SkipElement,
      LoadingElement,
    ];
  }

  constructor(clock,
              imageProvider,
              bgElement,
              titleElement,
              widgetElement,
              descriptionElement,
              skipElement,
              loadingElement) {
    this.clock = clock;
    this.imageProvider = imageProvider;
    this.bgElement = bgElement;
    this.widgetElement = widgetElement;
    this.titleElement = titleElement;
    this.descriptionElement = descriptionElement;
    this.skipElement = skipElement;
    this.loadingElement = loadingElement;
  }

  init() {
    this._initBackground();
    this._registerListener();
    this.clock.run();
  }

  _initBackground() {
    this.imageProvider.getCurrentImage()
      .then((image) => {
        this._setBackground(image);
        this.imageProvider.downloadNextImages();
      })
      .catch(this._printError);
  }

  _registerListener() {
    this.bgElement.onclick = this._toggleInfoBox.bind(this);
    this.skipElement.onclick = this._skipImage.bind(this);
  }

  _toggleInfoBox() {
    if (this.widgetElement.style.visibility === 'hidden') {
      this.widgetElement.style.visibility = 'visible';
    } else {
      this.widgetElement.style.visibility = 'hidden';
    }
  }

  _skipImage() {
    this._startLoading();
    this.imageProvider.skipCurrentImage()
      .then((nextImage) => {
        this._setBackground(nextImage);
        this._stopLoading();
      })
      .catch((error) => {
        this._printError(error);
        this._stopLoading();
      });
  }

  _setBackground(image) {
    this.bgElement.style['background-image'] = `url(${image.dataUri})`;
    this.titleElement.textContent = image.title;
    this.titleElement.setAttribute('href', image.details || image.image);
    this.descriptionElement.textContent = this._getDescription(image);
  }

  _startLoading() {
    this.skipElement.classList.add('disabled');
    this.loadingElement.style.visibility = 'visible';
  }

  _stopLoading() {
    this.skipElement.classList.remove('disabled');
    this.loadingElement.style.visibility = 'hidden';
  }

  _getDescription(image) {
    if (!image.completitionYear || image.completitionYear === '-1') {
      return image.artistName;
    }
    return `${image.artistName}, ${image.completitionYear}`;
  }

  _printError(error) {
    const ISSUES_URL = 'https://github.com/fawind/picasso/issues';
    /* eslint-disable no-console */
    console.error(
      'Error while loading background image. ' +
      'Please check that you are connected to the internet and try again. ' +
      `If the error persists, please open an issue: ${ISSUES_URL}`);
    console.error(error);
    /* eslint-enable no-console */
  }
}

(function initNewTab() {
  constitute(NewTab).init();
}());
