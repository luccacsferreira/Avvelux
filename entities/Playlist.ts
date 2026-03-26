{
  "name": "Playlist",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Playlist name"
    },
    "description": {
      "type": "string"
    },
    "video_ids": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of video IDs"
    },
    "thumbnail_url": {
      "type": "string"
    },
    "is_public": {
      "type": "boolean",
      "default": false
    },
    "user_id": {
      "type": "string"
    }
  },
  "required": [
    "name"
  ]
}