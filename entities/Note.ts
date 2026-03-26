{
  "name": "Note",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Note title"
    },
    "content": {
      "type": "string",
      "description": "Note content"
    },
    "video_id": {
      "type": "string",
      "description": "Associated video ID if any"
    },
    "user_id": {
      "type": "string",
      "description": "Owner user ID"
    }
  },
  "required": [
    "title",
    "content"
  ]
}