# Article Share Chrome Extension (MVP)

A Chrome extension that helps you share online articles with personalized context and audience-specific summaries.

## Features (MVP)

- **Article Extraction**: Automatically extracts content from the current web page
- **Context Addition**: Allows you to specify why you're sharing the article
- **Audience Selection**: Choose your target audience to tailor the summary
- **Summary Generation**: Creates a concise summary based on article content and specified audience
- **Editing Capabilities**: Edit the generated summary before sharing
- **Copy to Clipboard**: Easily copy the final summary to share on any platform

## Installation (Development)

1. Clone this repository:
   ```
   git clone [repository-url]
   cd article-share
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" by toggling the switch in the top right corner
   - Click "Load unpacked" and select the root directory of this project

## How to Use

1. Navigate to an article you want to share
2. Click the Article Share extension icon in your Chrome toolbar
3. Wait for the article to be extracted
4. Enter why you're sharing this article in the context field
5. Select your target audience from the dropdown
6. Review and edit the generated summary
7. Click "Copy to Clipboard" to copy the summary
8. Paste the summary into your preferred sharing platform

## Development Notes

### Project Structure

```
article-share/
├── manifest.json          # Extension configuration
├── src/
│   ├── css/
│   │   └── popup.css      # Styles for the popup UI
│   ├── images/            # Extension icons
│   ├── js/
│   │   ├── background.js  # Background script
│   │   ├── content.js     # Content script (article extraction)
│   │   └── popup.js       # Popup UI script
│   └── popup.html         # Popup UI markup
└── README.md              # This file
```

### MVP Limitations

- Simple extractive summarization algorithm (not AI-powered in MVP)
- Basic article extraction that works best on common news sites
- No direct platform integration (uses clipboard)
- Limited error handling
- No sharing history or templates

## Future Enhancements (Post-MVP)

- Integration with AI services for better summaries
- Direct sharing to social platforms
- Sharing history
- Custom templates
- Team collaboration features
- Advanced content processing for specialized sources

## License

[License information goes here]

## Credits

[Credits information goes here] 