#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { WatermarkEngine, WatermarkSize } = require('./watermark_engine');
const path = require('path');
const fs = require('fs');

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      type: 'string',
      description: 'Input image file or directory',
      demandOption: true,
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      description: 'Output image file or directory',
      demandOption: true,
    })
    .option('remove', {
      alias: 'r',
      type: 'boolean',
      description: 'Remove watermark (default action)',
    })
    .option('add', {
      alias: 'a',
      type: 'boolean',
      description: 'Add watermark',
      conflicts: 'remove',
    })
    .option('force-small', {
      type: 'boolean',
      description: 'Force small watermark (48x48)',
    })
    .option('force-large', {
      type: 'boolean',
      description: 'Force large watermark (96x96)',
    })
    .conflicts('force-small', 'force-large')
    .help().argv;

  const removeMode = argv.add ? false : true;
  let forceSize = null;
  if (argv['force-small']) forceSize = WatermarkSize.Small;
  if (argv['force-large']) forceSize = WatermarkSize.Large;

  const engine = new WatermarkEngine();

  try {
    await engine.init();

    const inputPath = path.resolve(argv.input);
    const outputPath = path.resolve(argv.output);

    if (!fs.existsSync(inputPath)) {
      console.error(`Input path not found: ${inputPath}`);
      process.exit(1);
    }

    const stat = fs.statSync(inputPath);

    if (stat.isDirectory()) {
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const files = fs.readdirSync(inputPath);
      let successCount = 0;
      let failCount = 0;

      console.log(`Batch processing directory: ${inputPath}`);

      for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|webp|bmp)$/i)) {
          const inFile = path.join(inputPath, file);
          const outFile = path.join(outputPath, file);

          try {
            process.stdout.write(`Processing: ${file}... `);
            await engine.processImage(inFile, outFile, removeMode, forceSize);
            console.log('OK');
            successCount++;
          } catch (err) {
            console.log('FAILED');
            console.error(`  Error: ${err.message}`);
            failCount++;
          }
        }
      }
      console.log(
        `\nCompleted: ${successCount} succeeded, ${failCount} failed.`
      );
    } else {
      try {
        console.log(`Processing: ${path.basename(inputPath)}`);
        await engine.processImage(inputPath, outputPath, removeMode, forceSize);
        console.log(`[OK] Success: ${outputPath}`);
      } catch (err) {
        console.error(`Error:`, err.message);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

main();
