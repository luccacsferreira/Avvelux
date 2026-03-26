{
  "name": "Video",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Video title"
    },
    "description": {
      "type": "string",
      "description": "Video description"
    },
    "thumbnail_url": {
      "type": "string",
      "description": "Thumbnail image URL"
    },
    "video_url": {
      "type": "string",
      "description": "Video file URL"
    },
    "duration": {
      "type": "string",
      "description": "Video duration (e.g., 15:42)"
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
      "type": "string",
      "description": "Main category"
    },
    "subcategory": {
      "type": "string",
      "description": "Subcategory within main category"
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
      "type": "string",
      "description": "Creator user ID"
    },
    "creator_name": {
      "type": "string",
      "description": "Creator display name"
    },
    "creator_avatar": {
      "type": "string",
      "description": "Creator avatar URL"
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