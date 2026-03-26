{
  "name": "WatchHistory",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string"
    },
    "content_type": {
      "type": "string",
      "enum": [
        "video",
        "clip",
        "post",
        "course"
      ]
    },
    "content_id": {
      "type": "string"
    },
    "watched_at": {
      "type": "string",
      "format": "date-time"
    },
    "progress_seconds": {
      "type": "number"
    }
  },
  "required": [
    "user_id",
    "content_type",
    "content_id"
  ]
}