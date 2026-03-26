{
  "name": "Clip",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Clip title"
    },
    "description": {
      "type": "string",
      "description": "Clip description"
    },
    "thumbnail_url": {
      "type": "string",
      "description": "Thumbnail image URL"
    },
    "video_url": {
      "type": "string",
      "description": "Vertical video file URL"
    },
    "duration": {
      "type": "string",
      "description": "Clip duration"
    },
    "views": {
      "type": "number",
      "description": "View count"
    },
    "likes": {
      "type": "number",
      "description": "Like count"
    },
    "category": {
      "type": "string"
    },
    "subcategory": {
      "type": "string"
    },
    "privacy": {
      "type": "string",
      "enum": [
        "public",
        "private",
        "unlisted"
      ],
      "default": "public"
    },
    "creator_id": {
      "type": "string"
    },
    "creator_name": {
      "type": "string"
    },
    "creator_avatar": {
      "type": "string"
    },
    "language": {
      "type": "string",
      "enum": [
        "en",
        "pt",
        "nl",
        "fr",
        "es",
        "de",
        "it",
        "ja",
        "ko",
        "zh"
      ],
      "default": "en",
      "description": "Content language code"
    }
  },
  "required": [
    "title"
  ]
}