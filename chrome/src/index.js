import $ from 'jquery';

import Clock from './js/clock';
import ImageProvider from './js/imageProvider';

import './main.css';


const bgElement = $('.bg');
const clockElement = $('.clock');
const infoElement = $('#info');
const titleElement = $('#title');
const artistElement = $('#artist');
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
    if (infoElement.css('visibility') === 'hidden') {
      infoElement.css('visibility', 'visible');
    } else {
      infoElement.css('visibility', 'hidden');
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
    artistElement.text(image.artistname);
  }
}

(function initNewTab() {
  NewTab.init();
}());
