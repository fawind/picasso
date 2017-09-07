import re
import urllib.request
import json
import multiprocessing
import time
from lxml import html
import pandas as pd


class Image:
    def __init__(self, title, artistName, completionYear, imageUrl, detailsUrl, width, height):
        self.title = title
        self.artistName = artistName
        self.completionYear = completionYear
        self.imageUrl = imageUrl
        self.detailsUrl = detailsUrl
        self.width = width
        self.height = height

    def to_dict(self):
        return {'title': self.title, 'artistName': self.artistName,
                'completionYear': self.completionYear, 'imageUrl': self.imageUrl,
                'detailsUrl': self.detailsUrl, 'width': self.width, 'height': self.height}

    def __str__(self):
        return str(self.to_dict())

    def __repr__(self):
        return self.__str__()


class BaseExtractor:

    def extract_images(self):
        raise NotImplementedError()


class MostViewedWikiArtExtractor(BaseExtractor):

    IMAGE_ID_RE = re.compile(r'(\/images\/)(?P<image_id>.*?)((\(\d+\))?.jpg)')

    def __init__(self):
        self.URL = 'https://www.wikiart.org/en/App/Painting/MostViewedPaintings?randomSeed=123&json=2'

    def extract_images(self):
        raw_images = pd.read_json(self.URL)
        raw_images['details'] = raw_images.image.apply(self._get_details_url)
        images = []
        for index, row in raw_images.iterrows():
            images.append(Image(row['title'], row['artistName'], row['completitionYear'], row['image'],
                                row['details'], row['width'], row['height']))
        return images

    def _get_details_url(self, image_url):
        # TODO, HACK: Contact wikiarts team to get an API method for this...
        special_cases = {
            'https://wikiart.org/en/vincent-van-gogh/the-starry-night': 'https://www.wikiart.org/en/vincent-van-gogh/the-starry-night-1889',
            'https://wikiart.org/en/gustav-klimt/portrait-of-adele-bloch-bauer-i': 'https://www.wikiart.org/en/gustav-klimt/portrait-of-adele-bloch-bauer-i-1907-1',
            'https://wikiart.org/en/pieter-bruegel-the-elder/fight-between-carnival-and-lent-1559': 'https://www.wikiart.org/en/pieter-bruegel-the-elder/the-fight-between-carnival-and-lent-1559-1',
            'https://wikiart.org/en/pieter-bruegel-the-elder/the-triumph-of-death': 'https://www.wikiart.org/en/pieter-bruegel-the-elder/the-triumph-of-death-1562-1',
            'https://wikiart.org/en/edouard-manet/music-in-the-tuileries-gardens-1862': 'https://www.wikiart.org/en/edouard-manet/music-in-the-tuileries-garden-1862-1',
            'https://wikiart.org/en/gustav-klimt/the-beethoven-frieze-the-hostile-powers-far-wall': 'https://www.wikiart.org/en/gustav-klimt/the-beethoven-frieze-the-hostile-powers-far-wall-1902-1',
            'https://wikiart.org/en/gustav-klimt/the-beethoven-frieze-the-longing-for-happiness-finds-repose-in-poetry-right-wall-1': 'https://www.wikiart.org/en/gustav-klimt/the-beethoven-frieze-the-longing-for-happiness-finds-repose-in-poetry-right-wall-1902-1',
            'https://wikiart.org/en/honore-daumier/gargantua': 'https://www.wikiart.org/en/honore-daumier/gargantua-1831',
            'https://wikiart.org/en/francois-boucher/triumph-of-venus-1740': 'https://www.wikiart.org/en/francois-boucher/the-birth-and-triumph-of-venus-1740-1',
            'https://wikiart.org/en/francisco-goya/execution-of-the-defenders-of-madrid-3rd-may-1808-1814': 'https://www.wikiart.org/en/francisco-goya/the-third-of-may-1808-execution-of-the-defenders-of-madrid-1814-1',
            'https://wikiart.org/en/giotto/lamentation-the-mourning-of-christ': 'https://www.wikiart.org/en/giotto/lamentation-the-mourning-of-christ-1306-1'

        }
        try:
            image_id = re.search(MostViewedWikiArtExtractor.IMAGE_ID_RE, image_url).group('image_id')
        except Exception as e:
            print('Error getting details url for image {}'.format(image_url))
            return image_url
        details_url = 'https://wikiart.org/en/{}'.format(image_id)
        if details_url in special_cases:
            return special_cases[details_url]
        return details_url


class MuzeiExtractor(BaseExtractor):
    """
    1) Extract muzei images from muzei archive
    2) Fetch additional infos (image_url, height, width) from wikiarts html page
    """

    BYLINE_RE = re.compile(r'(.+),\s.*?(\d+)')

    def extract_images(self, limit=None, processes=1, chunksize=200):
        muzei_images = self._get_muzei_archive()
        wikiart_images = [image for image in muzei_images if self._is_wikiart(image['details_url'])]
        print('Fetched {} images from muzei archive'.format(len(wikiart_images)))
        if limit:
            wikiart_images = wikiart_images[:limit]
        with multiprocessing.Pool(processes=processes) as pool:
            images = pool.map(MuzeiExtractor._get_image_details, wikiart_images, chunksize=chunksize)
        return [i for i in images if i is not None]

    def _get_muzei_archive(self):
        images = []
        for url in MuzeiUrlIterator():
            try:
                response = urllib.request.urlopen(url)
            except Exception as e:
                print('Error fetching Muzei archive {}'.format(url))
                raise e
            for r in response:
                images += json.loads(r.strip())
                break
        return images

    def _is_wikiart(self, image_url):
        return 'wikiart' in image_url or 'wikipaintings' in image_url

    @staticmethod
    def _parse_byline(byline):
        """Parse the Muzei Byline.
        Expected format is '<artistName>, <completionYear>'
        """
        match = MuzeiExtractor.BYLINE_RE.match(byline)
        if not match or len(match.groups()) != 2:
            return { 'artistName': byline, 'completionYear': -1 }
        groups = match.groups()
        return { 'artistName': groups[0], 'completionYear': groups[1] }


    @staticmethod
    def _get_image_details(image):
        try:
            xpath_image = '/html/head/meta[12]'
            xpath_width = '/html/head/meta[13]'
            xpath_height = '/html/head/meta[14]'
            time.sleep(0.2)
            req = urllib.request.Request(image['details_url'], data=None, headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'})
            page = html.fromstring(urllib.request.urlopen(req).read())
            imageUrl = page.xpath(xpath_image)[0].get('content')
            width = page.xpath(xpath_width)[0].get('content')
            height = page.xpath(xpath_height)[0].get('content')
            details = MuzeiExtractor._parse_byline(image['byline'])
            details_url = image['details_url'].replace('?utm_source=Muzei&utm_campaign=Muzei', '')
            return Image(image['title'], details['artistName'],
                         details['completionYear'], imageUrl,
                         details_url, width, height)
        except Exception as e:
            print('Error fetching details page {}: {}'.format(image['details_url'], e))
            return None


class MuzeiUrlIterator:

    BASE_URL = 'http://storage.googleapis.com/muzeifeaturedart/archivemeta/'
    START_DATE = {'year': 2014, 'month': 2}
    END_DATE = {'year': 2017, 'month': 8}

    def __init__(self, base_url=BASE_URL, start_date=START_DATE, end_date=END_DATE):
        self.end_date = end_date
        self.year = start_date['year']
        self.month = start_date['month']
        self.base_url = base_url

    def get_url(self):
        month = '0' + str(self.month) if self.month < 10 else str(self.month)
        return self.base_url + str(self.year) + month + '.txt'

    def __iter__(self):
        while not (self.month == self.end_date['month'] + 1 and
                self.year == self.end_date['year']):
            yield self.get_url()
            self.month += 1
            if self.month == 13:
                self.month = 1
                self.year += 1
