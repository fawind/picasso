import csv


class Artworks:

    def __init__(self, file_path='data/images.csv'):
        self._artworks = self._load_artworks(file_path)

    def _load_artworks(self, file_path):
        with open(file_path, 'r') as csv_file:
            reader = csv.DictReader(csv_file)
            return [r for r in reader]

    def get_batch(self, index, batch_size):
        results = []
        for i in xrange(index, index + batch_size):
            idx = i % len(self._artworks)
            results.append(self._artworks[idx])
        return results
