# Label generator 

A headless label generator API for printing various labels around the house using PDFKit and NodeJS

Send a POST request to `/` formatted as follows:

```json

{
    "sheet_name": "Test",
    "items": [
        {
            "subtitle": "Tracked by Adomi",
            "title": "RBP01",
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "barcode": "0000010101"
        }
    ]
}

```


You can use an empty dictionary in the `items` array to skip specific stickers.


By default, this will generate an A4 4x10 sticker sheet. Supports adding multiple sticker sheet sizes and layouts. 