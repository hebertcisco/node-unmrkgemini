<!-- Banner -->
<div align="center">
  <img src=".github/static/img/banner-dark.png" alt="unmrkgemini banner" width="100%">
  <h1>unmrkgemini</h1>
  <p><strong>A powerful Node.js library to add and remove Gemini-style watermarks from images</strong></p>
  
  <!-- Badges -->
  <p>
    <a href="https://www.npmjs.com/package/unmrkgemini">
      <img src="https://img.shields.io/npm/v/unmrkgemini.svg" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/unmrkgemini">
      <img src="https://img.shields.io/npm/dm/unmrkgemini.svg" alt="npm downloads" />
    </a>
    <a href="https://github.com/hebertcisco/node-unmrkgemini/actions/workflows/npm-publish.yml">
      <img src="https://github.com/hebertcisco/node-unmrkgemini/actions/workflows/npm-publish.yml/badge.svg" alt="npm publish" />
    </a>
    <a href="https://github.com/hebertcisco/node-unmrkgemini/actions/workflows/ci.yml">
      <img src="https://github.com/hebertcisco/node-unmrkgemini/actions/workflows/ci.yml/badge.svg" alt="CI" />
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
    </a>
    <a href="https://unmrkgemini.online/">
      <img src="https://img.shields.io/badge/Website-unmrkgemini.online-blue.svg" alt="Website" />
    </a>
  </p>
</div>

---

## ✨ Features

unmrkgemini is a powerful, high-performance image processing library for Node.js that features:

🖼️ **Add & Remove Watermarks** - Seamlessly add or remove Gemini-style watermarks from images  
⚡ **High Performance** - Built on top of Sharp for blazing-fast image processing  
🎯 **Multiple Sizes** - Support for small (48x48) and large (96x96) watermark sizes  
📁 **Batch Processing** - Process single images or entire directories  
🛠️ **CLI & Library** - Use as a command-line tool or integrate into your Node.js applications  
🔧 **Customizable** - Flexible API for custom watermark processing workflows  
📱 **Modern** - ES6+ support with async/await patterns  

---

## 📦 Installation

Install unmrkgemini from npm. To use it as a library in your project, install it locally:

```bash
npm install unmrkgemini
```

To use the command-line tool from anywhere on your system, install it globally:

```bash
npm install -g unmrkgemini
```

---

## 🚀 Quick Start

### Command Line Interface

The library includes a powerful CLI for easy batch processing of images.

**Remove Watermark (default action):**
```bash
unmrkgemini --input <input_path> --output <output_path>
```

**Add Watermark:**
```bash
unmrkgemini --input <input_path> --output <output_path> --add
```

**Options:**
*   `-i, --input`: Input image file or directory (required)
*   `-o, --output`: Output image file or directory (required)
*   `-a, --add`: Add watermark
*   `-r, --remove`: Remove watermark (default)
*   `--force-small`: Force small watermark (48x48)
*   `--force-large`: Force large watermark (96x96)

### Library Usage

You can also use the `WatermarkEngine` class directly in your code:

```javascript
const { WatermarkEngine, WatermarkSize } = require('unmrkgemini');
const path = require('path');

async function main() {
  const engine = new WatermarkEngine();
  await engine.init();

  const inputPath = path.join(__dirname, 'input.jpg');
  const outputPath = path.join(__dirname, 'output.jpg');

  // To remove a watermark
  await engine.processImage(inputPath, outputPath, true);

  // To add a watermark
  await engine.processImage(inputPath, outputPath, false);
}

main();
```

---

## 📖 API Reference

### WatermarkEngine

The main class for processing images with watermarks.

#### Methods

- **`init()`** - Initialize the watermark engine
- **`processImage(inputPath, outputPath, remove)`** - Process a single image
  - `inputPath`: Path to input image
  - `outputPath`: Path to save processed image
  - `remove`: Boolean, `true` to remove watermark, `false` to add

---

## 🛠️ Examples

### Batch Processing

Process multiple images in a directory:

```bash
# Remove watermarks from all images in a folder
unmrkgemini --input ./images/ --output ./processed/

# Add watermarks to specific images
unmrkgemini --input ./photo1.jpg --output ./photo1_watermarked.jpg --add
```

### Programmatic Usage

```javascript
const { WatermarkEngine } = require('unmrkgemini');

async function batchProcess() {
  const engine = new WatermarkEngine();
  await engine.init();
  
  const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
  
  for (const image of images) {
    await engine.processImage(
      `input/${image}`, 
      `output/${image}`, 
      true // remove watermark
    );
  }
}

batchProcess();
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Show Your Support

If you find this project helpful, please consider giving it a star on GitHub!

**Repository:** [http://github.com/hebertcisco/node-unmrkgemini](http://github.com/hebertcisco/node-unmrkgemini)  
**Website:** [https://unmrkgemini.online/](https://unmrkgemini.online/)

---

## 📞 Contact

- **Author:** hebertcisco
- **GitHub:** [@hebertcisco](https://github.com/hebertcisco)
- **Issues:** [Project Issues](https://github.com/hebertcisco/node-unmrkgemini/issues)

---

<div align="center">
  <p><strong>Made with ❤️ by hebertcisco</strong></p>
</div>