{
  "name": "DirectMessage",
  "type": "object",
  "properties": {
    "conversation_id": {
      "type": "string",
      "description": "Unique conversation ID (sorted user IDs joined)"
    },
    "sender_id": {
      "type": "string"
    },
    "sender_name": {
      "type": "string"
    },
    "sender_avatar": {
      "type": "string"
    },
    "recipient_id": {
      "type": "string"
    },
    "recipient_name": {
      "type": "string"
    },
    "content": {
      "type": "string"
    },
    "read": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "conversation_id",
    "sender_id",
    "recipient_id",
    "content"
  ]
}