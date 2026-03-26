{
  "name": "ChatMessage",
  "type": "object",
  "properties": {
    "chat_id": {
      "type": "string",
      "description": "Chat session ID"
    },
    "user_id": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "enum": [
        "user",
        "assistant"
      ]
    },
    "content": {
      "type": "string"
    }
  },
  "required": [
    "chat_id",
    "role",
    "content"
  ]
}