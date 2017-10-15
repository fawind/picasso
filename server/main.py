import webapp2
import json
from artworks import Artworks


class Ping(webapp2.RequestHandler):

    def get(self):
        self.response.write(json.dumps({'status': 'ok'}))


class Home(webapp2.RequestHandler):

    def get(self):
        GITHUB_HOME = 'https://github.com/fawind/picasso'
        self.redirect(GITHUB_HOME)


class DeprecatedImageBatch(webapp2.RequestHandler):
    """TODO: Remove after clients have updated"""

    def __init__(self, *args, **kwargs):
        super(DeprecatedImageBatch, self).__init__(*args, **kwargs)
        self._artworks = Artworks('data/old-images.csv')
        self._default_batch_size = 10

    def get(self, index):
        index = int(index) if index else 0
        batch = self._artworks.get_batch(index, self._default_batch_size)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(batch))


class ImageBatch(webapp2.RequestHandler):

    def __init__(self, *args, **kwargs):
        super(ImageBatch, self).__init__(*args, **kwargs)
        self._artworks = Artworks()
        self._default_batch_size = 10

    def get(self, index):
        index = int(index) if index else 0
        batch = self._artworks.get_batch(index, self._default_batch_size)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(batch))


application = webapp2.WSGIApplication([
    ('/ping', Ping),
    ('/api/v1/image/batch/(\d*)', DeprecatedImageBatch),
    ('/api/v2/image/batch/(\d*)', ImageBatch),
    ('/', Home)
], debug=False)
