import $ from 'jquery';

import Clock from './js/clock';
import ImageProvider from './js/imageProvider';

import './main.css';


const bgElement = $('.bg');
const clockElement = $('.clock');
const widgetElement = $('.widget');
const titleElement = $('#title');
const descriptionElement = $('#description');
const skipElement = $('#skip');


class NewTab {

  static init() {
    NewTab._initBackground();
    NewTab._registerListener();
    new Clock(clockElement).run();
  }

  static _initBackground() {
    ImageProvider.getCurrentImage()
      .then(image => NewTab._setBackground(image));
  }

  static _registerListener() {
    bgElement.click(NewTab._toggleInfoBox);
    skipElement.click(NewTab._skipImage);
  }

  static _toggleInfoBox() {
    if (widgetElement.css('visibility') === 'hidden') {
      widgetElement.css('visibility', 'visible');
    } else {
      widgetElement.css('visibility', 'hidden');
    }
  }

  static _skipImage() {
    ImageProvider.skipCurrentImage()
      .then((nextImage) => {
        NewTab._setBackground(nextImage);
      });
  }

  static _setBackground(image) {
    bgElement.css('background-image', `url(${image.dataUri})`);
    titleElement.text(image.title).attr('href', image.image);
    descriptionElement.text(NewTab._getDescription(image));
  }

  static _getDescription(image) {
    if (!image.completitionYear || image.completitionYear === '-1') {
      return image.artistName;
    }
    return `${image.artistName}, ${image.completitionYear}`;
  }
}

(function initNewTab() {
  NewTab.init();
}());
