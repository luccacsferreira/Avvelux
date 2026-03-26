{
  "name": "Group",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Group name"
    },
    "description": {
      "type": "string",
      "description": "Group description"
    },
    "category": {
      "type": "string",
      "enum": [
        "Self-Help",
        "Business",
        "General"
      ],
      "description": "Interest category"
    },
    "image_url": {
      "type": "string",
      "description": "Group cover image"
    },
    "creator_id": {
      "type": "string"
    },
    "creator_name": {
      "type": "string"
    },
    "member_ids": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of member user IDs"
    },
    "member_count": {
      "type": "number",
      "default": 1
    },
    "is_public": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "name",
    "category"
  ]
}