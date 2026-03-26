{
  "name": "Story",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Story owner"
    },
    "media_url": {
      "type": "string",
      "description": "Image or video URL"
    },
    "media_type": {
      "type": "string",
      "enum": [
        "image",
        "video"
      ]
    },
    "expires_at": {
      "type": "string",
      "format": "date-time",
      "description": "24 hours after creation"
    },
    "viewers": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of user IDs who viewed"
    }
  },
  "required": [
    "user_id",
    "media_url",
    "media_type",
    "expires_at"
  ]
}