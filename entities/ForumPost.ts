{
  "name": "ForumPost",
  "type": "object",
  "properties": {
    "group_id": {
      "type": "string",
      "description": "Group or category this post belongs to"
    },
    "group_name": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "content": {
      "type": "string"
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
    "likes": {
      "type": "number",
      "default": 0
    },
    "reply_count": {
      "type": "number",
      "default": 0
    },
    "is_pinned": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "title",
    "content",
    "group_id"
  ]
}