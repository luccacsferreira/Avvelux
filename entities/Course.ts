{
  "name": "Course",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Course title"
    },
    "description": {
      "type": "string",
      "description": "Course description"
    },
    "thumbnail_url": {
      "type": "string",
      "description": "Cover image URL"
    },
    "category": {
      "type": "string",
      "description": "Course category"
    },
    "instructor_name": {
      "type": "string"
    },
    "instructor_id": {
      "type": "string"
    },
    "instructor_avatar": {
      "type": "string"
    },
    "lessons": {
      "type": "array",
      "description": "List of lessons",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "video_url": {
            "type": "string"
          },
          "thumbnail_url": {
            "type": "string"
          },
          "duration": {
            "type": "string"
          }
        }
      }
    },
    "total_lessons": {
      "type": "number"
    },
    "total_duration": {
      "type": "string"
    },
    "level": {
      "type": "string",
      "enum": [
        "Beginner",
        "Intermediate",
        "Advanced"
      ],
      "default": "Beginner"
    },
    "is_free": {
      "type": "boolean",
      "default": true
    },
    "enrolled_count": {
      "type": "number",
      "default": 0
    },
    "rating": {
      "type": "number"
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
      "description": "Course language code"
    }
  },
  "required": [
    "title",
    "category"
  ]
}