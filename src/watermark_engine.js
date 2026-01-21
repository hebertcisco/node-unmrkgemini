const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const {
  calculateAlphaMap,
  removeWatermarkAlphaBlend,
  addWatermarkAlphaBlend,
} = require('./blend_modes');

const WatermarkSize = {
  Small: 'Small',
  Large: 'Large',
};

class WatermarkEngine {
  constructor() {
    this.alphaMapSmall = null;
    this.alphaMapLarge = null;
    this.logoValue = 255.0;
    this.initialized = false;
  }

  /**
   * Initializes the engine by loading assets and calculating alpha maps.
   * This method must be called before any processing can occur.
   */
  async init() {
    if (this.initialized) return;

    const assetsDir = path.join(__dirname, '../assets');
    const bgSmallPath = path.join(assetsDir, 'bg_48.png');
    const bgLargePath = path.join(assetsDir, 'bg_96.png');

    if (!fs.existsSync(bgSmallPath) || !fs.existsSync(bgLargePath)) {
      throw new Error(
        'Background assets not found. Please ensure assets/bg_48.png and assets/bg_96.png exist.'
      );
    }

    const smallBuffer = await sharp(bgSmallPath)
      .resize(48, 48)
      .removeAlpha()
      .raw()
      .toBuffer();

    this.alphaMapSmall = calculateAlphaMap(smallBuffer, 48, 48);

    const largeBuffer = await sharp(bgLargePath)
      .resize(96, 96)
      .removeAlpha()
      .raw()
      .toBuffer();

    this.alphaMapLarge = calculateAlphaMap(largeBuffer, 96, 96);

    this.initialized = true;
  }

  /**
   * Determines the appropriate watermark size based on image dimensions,
   * following Gemini's rules.
   * @param {number} width The width of the image.
   * @param {number} height The height of the image.
   * @returns {string} The watermark size, either 'Small' or 'Large'.
   */
  getWatermarkSize(width, height) {
    if (width > 1024 && height > 1024) {
      return WatermarkSize.Large;
    }
    return WatermarkSize.Small;
  }

  /**
   * Retrieves the watermark configuration (position, size, alpha map)
   * for a given image dimension and optional forced size.
   * @param {number} width The width of the image.
   * @param {number} height The height of the image.
   * @param {string} [forceSize=null] An optional string to force a specific size ('Small' or 'Large').
   * @returns {object} A configuration object for the watermark.
   */
  getWatermarkConfig(width, height, forceSize = null) {
    const size = forceSize || this.getWatermarkSize(width, height);

    if (size === WatermarkSize.Large) {
      return {
        size: WatermarkSize.Large,
        logoSize: 96,
        marginRight: 64,
        marginBottom: 64,
        alphaMap: this.alphaMapLarge,
      };
    } else {
      return {
        size: WatermarkSize.Small,
        logoSize: 48,
        marginRight: 32,
        marginBottom: 32,
        alphaMap: this.alphaMapSmall,
      };
    }
  }

  /**
   * Processes an image to add or remove a watermark.
   * @param {string|Buffer} inputPath The path to the input image or a Buffer containing the image data.
   * @param {string} outputPath The path to save the processed image.
   * @param {boolean} [remove=true] Set to true to remove the watermark, false to add it.
   * @param {string} [forceSize=null] Optionally force a specific watermark size ('Small' or 'Large').
   * @returns {Promise<boolean>} A promise that resolves to true upon successful processing.
   */
  async processImage(inputPath, outputPath, remove = true, forceSize = null) {
    if (!this.initialized) await this.init();

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    const { data, info } = await image
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;

    const config = this.getWatermarkConfig(width, height, forceSize);

    const posX = width - config.marginRight - config.logoSize;
    const posY = height - config.marginBottom - config.logoSize;

    if (remove) {
      removeWatermarkAlphaBlend(
        data,
        width,
        height,
        config.alphaMap,
        config.logoSize,
        config.logoSize,
        posX,
        posY,
        this.logoValue
      );
    } else {
      addWatermarkAlphaBlend(
        data,
        width,
        height,
        config.alphaMap,
        config.logoSize,
        config.logoSize,
        posX,
        posY,
        this.logoValue
      );
    }

    await sharp(data, {
      raw: {
        width: width,
        height: height,
        channels: 3,
      },
    })
      .withMetadata()
      .toFile(outputPath);

    return true;
  }
}

module.exports = { WatermarkEngine, WatermarkSize };
