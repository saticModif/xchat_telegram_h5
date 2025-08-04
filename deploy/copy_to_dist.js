const fs = require('fs');
const path = require('path');

// Get target directory from command line arguments or use default
const targetDir = process.argv[2] || 'dist';

console.log(`Copying static files to ${targetDir}...`);

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Function to copy file
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied: ${src} -> ${dest}`);
  } catch (error) {
    console.error(`✗ Failed to copy: ${src}`, error.message);
  }
}

// Function to copy directory recursively
function copyDir(src, dest) {
  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error(`✗ Failed to copy directory: ${src}`, error.message);
  }
}

// Copy public directory contents
console.log('\nCopying public files...');
if (fs.existsSync('public')) {
  copyDir('public', targetDir);
}

// Copy lib directory WASM files
console.log('\nCopying WASM files...');
const wasmFiles = [
  'src/lib/rlottie/rlottie-wasm.wasm',
  'src/lib/fasttextweb/fasttext-wasm.wasm'
];

wasmFiles.forEach(file => {
  if (fs.existsSync(file)) {
    copyFile(file, path.join(targetDir, path.basename(file)));
  } else {
    console.error(`✗ File not found: ${file}`);
  }
});

// Copy opus-recorder WASM file
console.log('\nCopying opus-recorder files...');
const opusFile = 'node_modules/opus-recorder/dist/decoderWorker.min.wasm';
if (fs.existsSync(opusFile)) {
  copyFile(opusFile, path.join(targetDir, 'decoderWorker.min.wasm'));
} else {
  console.error(`✗ File not found: ${opusFile}`);
}

// Copy emoji data
console.log('\nCopying emoji data...');
const emojiDirs = [
  'node_modules/emoji-data-ios/img-apple-64',
  'node_modules/emoji-data-ios/img-apple-160'
];

emojiDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const dirName = path.basename(dir);
    copyDir(dir, path.join(targetDir, dirName));
  } else {
    console.error(`✗ Directory not found: ${dir}`);
  }
});

console.log('\n✓ Static files copied successfully!'); 