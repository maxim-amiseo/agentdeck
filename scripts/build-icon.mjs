import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const resourcesDir = join(__dirname, '..', 'resources')
const svgPath = join(resourcesDir, 'icon.svg')
const svgBuffer = readFileSync(svgPath)

const sizes = [16, 24, 32, 48, 64, 128, 256]

const pngBuffers = await Promise.all(
  sizes.map((size) => sharp(svgBuffer, { density: 384 }).resize(size, size).png().toBuffer())
)

writeFileSync(join(resourcesDir, 'icon.png'), pngBuffers[pngBuffers.length - 1])

const icoBuffer = await pngToIco(pngBuffers)
writeFileSync(join(resourcesDir, 'icon.ico'), icoBuffer)

console.log('Generated resources/icon.png and resources/icon.ico')
