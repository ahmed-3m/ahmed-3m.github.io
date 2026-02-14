const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
const publicDir = path.join(__dirname, '..', 'public');

const svgContent = fs.readFileSync(svgPath, 'utf8');
const svgBuffer = Buffer.from(svgContent);

const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
];

async function generateIcons() {
    for (const { name, size } of sizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(publicDir, name));
        console.log(`Generated ${name} (${size}x${size})`);
    }

    // Also generate favicon.ico from 32x32
    const ico32 = await sharp(svgBuffer)
        .resize(32, 32)
        .png()
        .toBuffer();
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32);
    console.log('Generated favicon.ico');

    console.log('All icons generated!');
}

generateIcons().catch(console.error);
