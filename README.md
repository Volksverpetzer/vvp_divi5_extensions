# Instagram Slideshow for DIVI 5

This extension provides a custom DIVI 5 module to display Instagram carousel posts as interactive slideshows. It fetches data from the Volksverpetzer Instagram Proxy API.

## Features

- **Dynamic Data**: Fetches real-time data from Instagram carousel posts.
- **Interactive Slideshow**: Previous/Next navigation, pagination dots.
- **Autoplay**: Configurable transition speed.
- **Responsive**: Aspect-ratio based sizing with mobile optimization.
- **Touch Support**: Swipe left/right on mobile devices.
- **Keyboard Support**: Left/Right arrow keys navigation.
- **Visual Builder Integration**: Full live preview and settings control in DIVI 5.

## Installation

1. Copy the `instagram-slideshow-extension` folder to your WordPress `wp-content/plugins/` directory.
2. In the plugin directory, install dependencies:
   ```bash
   composer install
   npm install
   ```
3. Build the assets:
   ```bash
   npm run build
   ```
4. Activate the plugin in the WordPress Admin dashboard.

## Development

- `npm run start`: Start webpack with watch mode for development.
- `npm run build`: Build production assets.
- `npm run zip`: Create a distribution ZIP file.

## Configuration

Add the "Instagram Slideshow" module to any DIVI page.
Settings include:
- **Instagram Post ID**: The unique ID of the post (e.g., `17881655640351114`).
- **Show Caption**: Toggle Instagram caption display.
- **Show Navigation**: Toggle arrows.
- **Show Pagination**: Toggle dots.
- **Autoplay**: Enable/Disable auto-advance.
- **Transition Speed**: Seconds between slides.

## API Requirements

The module expects a JSON response from:
`https://volksverpetzer-app.de/proxy/instaById/{post_id}`

Format:
```json
{
  "media_type": "CAROUSEL_ALBUM",
  "children": {
    "data": [
      { "media_url": "...", "id": "..." }
    ]
  },
  "caption": "...",
  "permalink": "..."
}
```
