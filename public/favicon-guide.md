# How to Change Your Portfolio Favicon

## Current Favicon Location
Your favicon is located at: `src/app/favicon.ico`

## Method 1: Replace the Existing Favicon (Simplest)

1. **Prepare your new favicon:**
   - Create or find your desired image/logo
   - Should be square (e.g., 512x512px)
   - Simple design works best at small sizes

2. **Convert to ICO format:**
   - Use [favicon.io](https://favicon.io/) (free)
   - Or [realfavicongenerator.net](https://realfavicongenerator.net/)
   - Upload your image and download the favicon.ico

3. **Replace the file:**
   ```bash
   # Replace the existing favicon
   cp /path/to/your/new/favicon.ico src/app/favicon.ico
   ```

## Method 2: Use Multiple Icon Formats (Recommended)

For better compatibility across all devices, create multiple icon files:

1. **Create these files in `src/app/`:**
   - `favicon.ico` - 32x32 (for older browsers)
   - `icon.png` - 32x32 PNG
   - `icon.svg` - SVG format (scalable)
   - `apple-icon.png` - 180x180 (for Apple devices)

2. **Next.js will automatically use these files**

## Method 3: Use Next.js Icon Generation

Create an `icon.tsx` file in `src/app/`:

```tsx
// src/app/icon.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
        }}
      >
        A
      </div>
    ),
    {
      ...size,
    }
  )
}
```

## Quick Favicon Generators

### Option 1: Text-based Favicon
Generate a simple letter-based favicon:
- [favicon.io/favicon-generator/](https://favicon.io/favicon-generator/)
- Choose text: "A" or "AM"
- Select colors matching your brand
- Download and replace

### Option 2: Emoji Favicon
Use an emoji as favicon:
- [favicon.io/emoji-favicons/](https://favicon.io/emoji-favicons/)
- Choose: 🤖 (robot) or 🧠 (brain) or 💻 (laptop)
- Download and replace

### Option 3: Logo from Image
If you have a logo:
- [realfavicongenerator.net](https://realfavicongenerator.net/)
- Upload your logo
- Generates all sizes and formats
- Includes manifest updates

## Apply Changes

After replacing the favicon:

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Test locally:**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

3. **Commit and push:**
   ```bash
   git add src/app/favicon.ico
   git commit -m "Update portfolio favicon"
   git push
   ```

## Additional Icon Files (Optional)

For comprehensive coverage, add these to `public/`:

```
public/
├── icon-192.png      # PWA icon
├── icon-512.png      # PWA icon large
├── apple-touch-icon.png  # Apple devices
└── favicon-16x16.png    # Small favicon
```

Update `manifest.json` to reference new icons:
```json
{
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "32x32",
      "type": "image/x-icon"
    },
    {
      "src": "/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ]
}
```

## Tips
- Keep it simple - favicons are tiny
- Use your initials "AM" or "A"
- Match your brand colors (#2563eb blue)
- Test on multiple browsers
- Clear browser cache to see changes