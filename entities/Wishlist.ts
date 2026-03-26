{
  "name": "Wishlist",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Owner user ID"
    },
    "item_type": {
      "type": "string",
      "enum": [
        "product",
        "service"
      ],
      "description": "Type of item"
    },
    "item_id": {
      "type": "string",
      "description": "Product or Service ID"
    }
  },
  "required": [
    "user_id",
    "item_type",
    "item_id"
  ]
}