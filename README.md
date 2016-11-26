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

1. [**ImageSelection:**](https://github.com/fawind/picasso/blob/master/imageSelection/imageSelection.ipynb)
  * Fetch images from Wikidata and and filter the results based on aspect ratio and size.
  * Results are saved in a CSV file and used by the server.
2. [**Server:**](https://github.com/fawind/picasso/tree/master/server)
  * Given an offset, the server returns the next batch of images.
  * An image contains the image url and its metadata.
3. [**Chrome extension:**](https://github.com/fawind/picasso/tree/master/chrome)
  * New Tab Page. Fetches a batch of images from the server and stores them in the local storage. The image to display is removed from the batch and converted to a data URI. If the remaining batch gets too small, a new one is fetched.
