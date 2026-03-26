{
  "name": "Post",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Post title"
    },
    "content": {
      "type": "string",
      "description": "Post content text"
    },
    "image_url": {
      "type": "string",
      "description": "Optional image URL"
    },
    "poll_options": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "text": {
            "type": "string"
          },
          "votes": {
            "type": "number"
          }
        }
      },
      "description": "Poll options if post is a poll"
    },
    "is_poll": {
      "type": "boolean",
      "default": false
    },
    "likes": {
      "type": "number"
    },
    "comments_count": {
      "type": "number"
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
    "title",
    "content"
  ]
}