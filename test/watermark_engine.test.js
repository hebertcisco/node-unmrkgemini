const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { WatermarkEngine, WatermarkSize } = require('../src/watermark_engine');

const OUTPUT_DIR = path.join(__dirname, 'output');

async function createMockImage(width, height, color) {
  return sharp({ create: { width, height, channels: 3, background: color } }).png().toBuffer();
}

test.before(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
});

test.after(() => {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
});

test.describe('WatermarkEngine', () => {
  let engine;

  test.before(async () => {
    engine = new WatermarkEngine();
    await engine.init();
  });

  test('should initialize correctly', () => {
    assert.ok(engine.initialized, 'Engine should be initialized');
    assert.ok(engine.alphaMapSmall, 'Small alpha map should be loaded');
    assert.ok(engine.alphaMapLarge, 'Large alpha map should be loaded');
  });

  test('should determine watermark size correctly', () => {
    assert.strictEqual(engine.getWatermarkSize(800, 600), WatermarkSize.Small, 'Small for small images');
    assert.strictEqual(engine.getWatermarkSize(1200, 1100), WatermarkSize.Large, 'Large for large images');
    assert.strictEqual(engine.getWatermarkSize(1024, 1024), WatermarkSize.Small, 'Small for boundary case');
  });

  test('should add and remove a small watermark', async () => {
    const inputImage = await createMockImage(800, 600, { r: 200, g: 200, b: 200 });
    const watermarkedPath = path.join(OUTPUT_DIR, 'watermarked_small.png');
    const removedPath = path.join(OUTPUT_DIR, 'removed_small.png');

    await engine.processImage(inputImage, watermarkedPath, false, WatermarkSize.Small);
    assert.ok(fs.existsSync(watermarkedPath), 'Watermarked file should be created');

    await engine.processImage(watermarkedPath, removedPath, true, WatermarkSize.Small);
    assert.ok(fs.existsSync(removedPath), 'Removed file should be created');

    const { data: originalBuffer } = await sharp(inputImage).raw().toBuffer({ resolveWithObject: true });
    const { data: removedBuffer } = await sharp(removedPath).raw().toBuffer({ resolveWithObject: true });

    let totalDifference = 0;
    for (let i = 0; i < originalBuffer.length; i++) {
      totalDifference += Math.abs(originalBuffer[i] - removedBuffer[i]);
    }
    const mae = totalDifference / originalBuffer.length;

    assert.ok(mae < 1, `MAE should be less than 1, but was ${mae}`);
  });

  test('should process a real image correctly', async () => {
    const inputPath = path.join(__dirname, '../assets/the_battle_of_saint_george_and_the_dragon.png');
    const watermarkedPath = path.join(OUTPUT_DIR, 'watermarked_real.png');
    const removedPath = path.join(OUTPUT_DIR, 'removed_real.png');

    if (!fs.existsSync(inputPath)) {
      console.warn(`Skipping real image test: ${inputPath} not found.`);
      return;
    }

    await engine.processImage(inputPath, watermarkedPath, false);
    assert.ok(fs.existsSync(watermarkedPath), 'Watermarked file should be created');

    await engine.processImage(watermarkedPath, removedPath, true);
    assert.ok(fs.existsSync(removedPath), 'Removed file should be created');

    const { data: originalBuffer, info: originalInfo } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
    const { data: removedBuffer, info: removedInfo } = await sharp(removedPath).raw().toBuffer({ resolveWithObject: true });

    const resizedOriginalBuffer = await sharp(originalBuffer, { raw: { width: originalInfo.width, height: originalInfo.height, channels: originalInfo.channels } })
      .resize(removedInfo.width, removedInfo.height)
      .raw()
      .toBuffer();

    let totalDifference = 0;
    for (let i = 0; i < removedBuffer.length; i++) {
      totalDifference += Math.abs(resizedOriginalBuffer[i] - removedBuffer[i]);
    }
    const mae = totalDifference / removedBuffer.length;

    assert.ok(mae < 85, `MAE should be less than 85 for the real image, but was ${mae}`);
  });

  test('should add and remove a large watermark', async () => {
    const inputImage = await createMockImage(1200, 1100, { r: 150, g: 180, b: 200 });
    const watermarkedPath = path.join(OUTPUT_DIR, 'watermarked_large.png');
    const removedPath = path.join(OUTPUT_DIR, 'removed_large.png');

    await engine.processImage(inputImage, watermarkedPath, false, WatermarkSize.Large);
    assert.ok(fs.existsSync(watermarkedPath), 'Watermarked file should be created');

    await engine.processImage(watermarkedPath, removedPath, true, WatermarkSize.Large);
    assert.ok(fs.existsSync(removedPath), 'Removed file should be created');

    const { data: originalBuffer } = await sharp(inputImage).raw().toBuffer({ resolveWithObject: true });
    const { data: removedBuffer } = await sharp(removedPath).raw().toBuffer({ resolveWithObject: true });

    let totalDifference = 0;
    for (let i = 0; i < originalBuffer.length; i++) {
      totalDifference += Math.abs(originalBuffer[i] - removedBuffer[i]);
    }
    const mae = totalDifference / originalBuffer.length;

    assert.ok(mae < 1, `MAE should be less than 1, but was ${mae}`);
  });
});
