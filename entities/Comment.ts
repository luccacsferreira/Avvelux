{
  "name": "Comment",
  "type": "object",
  "properties": {
    "content_type": {
      "type": "string",
      "enum": [
        "video",
        "clip",
        "post",
        "product",
        "service"
      ]
    },
    "content_id": {
      "type": "string"
    },
    "user_id": {
      "type": "string"
    },
    "user_name": {
      "type": "string"
    },
    "user_avatar": {
      "type": "string"
    },
    "text": {
      "type": "string"
    },
    "likes": {
      "type": "number",
      "default": 0
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
      "description": "Comment language code"
    }
  },
  "required": [
    "content_type",
    "content_id",
    "user_id",
    "text"
  ]
}