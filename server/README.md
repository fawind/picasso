## API Server

Server to provide image resources.

## Setup

Download and install the [Google App Engine Python SDK](https://cloud.google.com/appengine/docs/python/download).

```
# Run dev server
${SDK_PATH}/dev_appserver.py .

# Deploy server
${SDK_PATH}/appcfg.py update .
```

## API

**GET:** `/api/v1/image/batch/<batch-id>`

Returns a batch of images.




