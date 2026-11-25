import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputImage = path.join(__dirname, 'public', 'aerotech.png');
const publicDir = path.join(__dirname, 'public');

async function generateIcon(size, filename, paddingPercent = 0.15) {
  const innerSize = Math.round(size * (1 - paddingPercent * 2));

  // Redimensiona manteniendo la proporción original de Aerotech
  const resizedLogo = await sharp(inputImage)
    .resize(innerSize, innerSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();


  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: resizedLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, filename));

  console.log(`Generado: ${filename} (${size}x${size})`);
}

async function run() {
  try {
    // Íconos estándar para PWA y Android (con zona segura)
    await generateIcon(192, 'pwa-192x192.png', 0.15);
    await generateIcon(512, 'pwa-512x512.png', 0.15);
    // Ícono para dispositivos Apple
    await generateIcon(180, 'apple-touch-icon.png', 0.10);
    // Favicon estándar
    await generateIcon(64, 'favicon.ico', 0.05);

    console.log('¡Todos los íconos de Aerotech se crearon en /public!');
  } catch (err) {
    console.error('Error al procesar la imagen:', err);
  }
}

run();