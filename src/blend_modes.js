const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Calculates an alpha map from a background capture buffer.
 * Assumes the input buffer is a 3-channel (RGB) raw buffer.
 * @param {Buffer} bgCaptureBuffer RGB buffer of the background capture.
 * @param {number} width The width of the buffer.
 * @param {number} height The height of the buffer.
 * @returns {Float32Array} A normalized alpha map with values from 0.0 to 1.0.
 */
function calculateAlphaMap(bgCaptureBuffer, width, height) {
  const pixelCount = width * height;
  const alphaMap = new Float32Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    const r = bgCaptureBuffer[i * 3];
    const g = bgCaptureBuffer[i * 3 + 1];
    const b = bgCaptureBuffer[i * 3 + 2];

    const maxVal = Math.max(r, g, b);
    alphaMap[i] = maxVal / 255.0;
  }

  return alphaMap;
}

/**
 * Removes a watermark from an image buffer using reverse alpha blending.
 * The buffer is modified in-place.
 * Formula: original = (watermarked - alpha * logo) / (1 - alpha)
 * @param {Buffer} imageBuffer RGB buffer of the target image.
 * @param {number} imgWidth Width of the target image.
 * @param {number} imgHeight Height of the target image.
 * @param {Float32Array} alphaMap The alpha map to use for removal.
 * @param {number} alphaWidth Width of the alpha map.
 * @param {number} alphaHeight Height of the alpha map.
 * @param {number} posX X position to apply the removal.
 * @param {number} posY Y position to apply the removal.
 * @param {number} [logoValue=255.0] The brightness value of the logo.
 */
function removeWatermarkAlphaBlend(
  imageBuffer,
  imgWidth,
  imgHeight,
  alphaMap,
  alphaWidth,
  alphaHeight,
  posX,
  posY,
  logoValue = 255.0
) {
  const alphaThreshold = 0.002;
  const maxAlpha = 0.99;

  const x1 = Math.max(0, posX);
  const y1 = Math.max(0, posY);
  const x2 = Math.min(imgWidth, posX + alphaWidth);
  const y2 = Math.min(imgHeight, posY + alphaHeight);

  if (x1 >= x2 || y1 >= y2) return;

  for (let y = y1; y < y2; y++) {
    const alphaRowOffset = (y - posY) * alphaWidth;
    const imgRowOffset = y * imgWidth;

    for (let x = x1; x < x2; x++) {
      const ax = x - posX;
      const alphaIndex = alphaRowOffset + ax;

      let alpha = alphaMap[alphaIndex];

      if (alpha < alphaThreshold) {
        continue;
      }

      alpha = Math.min(alpha, maxAlpha);
      const oneMinusAlpha = 1.0 - alpha;
      const alphaTimesLogo = alpha * logoValue;

      const imgIndex = (imgRowOffset + x) * 3;

      for (let c = 0; c < 3; c++) {
        const watermarked = imageBuffer[imgIndex + c];
        const original = (watermarked - alphaTimesLogo) / oneMinusAlpha;
        imageBuffer[imgIndex + c] = clamp(original, 0, 255);
      }
    }
  }
}

/**
 * Adds a watermark to an image buffer using alpha blending.
 * The buffer is modified in-place.
 * Formula: result = alpha * logo + (1 - alpha) * original
 * @param {Buffer} imageBuffer RGB buffer of the target image.
 * @param {number} imgWidth Width of the target image.
 * @param {number} imgHeight Height of the target image.
 * @param {Float32Array} alphaMap The alpha map to use for adding.
 * @param {number} alphaWidth Width of the alpha map.
 * @param {number} alphaHeight Height of the alpha map.
 * @param {number} posX X position to apply the addition.
 * @param {number} posY Y position to apply the addition.
 * @param {number} [logoValue=255.0] The brightness value of the logo.
 */
function addWatermarkAlphaBlend(
  imageBuffer,
  imgWidth,
  imgHeight,
  alphaMap,
  alphaWidth,
  alphaHeight,
  posX,
  posY,
  logoValue = 255.0
) {
  const alphaThreshold = 0.002;

  const x1 = Math.max(0, posX);
  const y1 = Math.max(0, posY);
  const x2 = Math.min(imgWidth, posX + alphaWidth);
  const y2 = Math.min(imgHeight, posY + alphaHeight);

  if (x1 >= x2 || y1 >= y2) return;

  for (let y = y1; y < y2; y++) {
    const alphaRowOffset = (y - posY) * alphaWidth;
    const imgRowOffset = y * imgWidth;

    for (let x = x1; x < x2; x++) {
      const ax = x - posX;
      const alphaIndex = alphaRowOffset + ax;

      let alpha = alphaMap[alphaIndex];

      if (alpha < alphaThreshold) continue;

      const oneMinusAlpha = 1.0 - alpha;
      const alphaTimesLogo = alpha * logoValue;

      const imgIndex = (imgRowOffset + x) * 3;

      for (let c = 0; c < 3; c++) {
        const original = imageBuffer[imgIndex + c];
        const result = alphaTimesLogo + oneMinusAlpha * original;
        imageBuffer[imgIndex + c] = clamp(result, 0, 255);
      }
    }
  }
}

module.exports = {
  calculateAlphaMap,
  removeWatermarkAlphaBlend,
  addWatermarkAlphaBlend,
};
