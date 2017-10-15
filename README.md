# [Picasso](https://chrome.google.com/webstore/detail/picasso-new-tab-page/dlckklnbefkepkjemodnlbjokaimbedb)

Art masterpieces in your browser tabs. Picasso replaces Chrome's default New Tab page with a wide selection of art masterpieces and shows you a new painting every day.
The images are provided by [Wikiart](https://www.wikiart.org/).

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/7422050/20642802/6bb8d3fc-b419-11e6-8350-31431ef3181c.png" width="600" alt="Picasso Preview"/>
</p>

## Installation

Install the current version from the [Chrome Web Store](https://chrome.google.com/webstore/detail/picasso-new-tab-page/dlckklnbefkepkjemodnlbjokaimbedb).

## Project Structure

The project is split in three parts:


1. [**Chrome extension:**](https://github.com/fawind/picasso/tree/master/chrome)
  * Fetches a batch of image urls from the server and stores them in a queue using the local storage.
  * The next N images are cached by converting them to data URIs.
  * If the queue gets too small, new image urls are fetched.
2. [**Server:**](https://github.com/fawind/picasso/tree/master/server)
  * Given an offset, the server returns the next batch of images.
  * An image contains the image url and its metadata.
3. [**ImageSelection:**](https://github.com/fawind/picasso/blob/master/imageSelection/imageSelection.ipynb)
  * Fetches images from Wikidata and filters the results based on aspect ratio and size.
  * Results are saved in a CSV file and used by the server.


