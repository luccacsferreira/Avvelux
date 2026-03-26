{
  "name": "LikedContent",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User who liked"
    },
    "content_type": {
      "type": "string",
      "enum": [
        "video",
        "clip",
        "post",
        "product",
        "service"
      ],
      "description": "Type of content"
    },
    "content_id": {
      "type": "string",
      "description": "Content ID"
    }
  },
  "required": [
    "user_id",
    "content_type",
    "content_id"
  ]
}