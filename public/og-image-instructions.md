# Generate OG Image Instructions

## How to create og-image.png from the HTML template:

1. Open `og-image-generator.html` in a browser
2. Open Developer Tools (F12)
3. Set device dimensions to 1200x630px
4. Take a screenshot using one of these methods:
   - Chrome: Cmd+Shift+P → "Capture screenshot" → "Capture full size screenshot"
   - Firefox: Right-click → "Take Screenshot" → "Save full page"
   - Or use any screenshot tool

5. Save as `og-image.png` in the public folder

## Alternative: Use an online tool

1. Visit https://htmlcsstoimage.com/ or similar service
2. Paste the HTML content
3. Set dimensions to 1200x630
4. Generate and download as og-image.png

## Quick Command Line Method (if you have Chrome):

```bash
# Using Puppeteer or Playwright
npx playwright screenshot --viewport-size="1200,630" \
  public/og-image-generator.html public/og-image.png
```

The image should be exactly 1200x630 pixels for optimal social media display.