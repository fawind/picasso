## API Server

Server to provide image resources.

## Setup

Download and install the [Google App Engine Python SDK](https://cloud.google.com/appengine/docs/python/download).

```
# Run dev server
${SDK_PATH}/dev_appserver.py .

# Deploy server
gcloud app deploy
```

## API

**GET:** `/api/v2/image/batch/<batch-id>`

Returns a batch of images:

```
Image:
  - title <str>
  - artistName <str>
  - completionYear <int>
  - detailsUrl <str>
  - imageUrl <str>
```




