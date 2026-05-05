import fs from 'fs';
import path from 'path';

const packageDir = process.argv[2];
const packageName = process.argv[3];
const outputName = process.argv[4];

if (!packageDir || !packageName || !outputName) {
  console.error('Usage: node post-process-wasm.js <packageDir> <packageName> <outputName>');
  process.exit(1);
}

const packageJsonPath = path.join(packageDir, 'package.json');
const jsPath = path.join(packageDir, `${outputName}.js`);

// 1. Fix package.json
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update name
  pkg.name = packageName;
  
  // Set main and remove module (as per run.sh requirements)
  pkg.main = `${outputName}.js`;
  delete pkg.module;
  
  // Clean up repository/homepage if they point to external sources
  delete pkg.repository;
  delete pkg.homepage;
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
  console.log(`Updated ${packageJsonPath}`);
}

// 2. Fix JS file (remove new URL(...) references)
if (fs.existsSync(jsPath)) {
  let js = fs.readFileSync(jsPath, 'utf8');
  // Remove lines containing new URL(...) for .wasm files
  js = js.split('\n').filter(line => !/new URL\(.*_bg\.wasm/.test(line)).join('\n');
  fs.writeFileSync(jsPath, js);
  console.log(`Updated ${jsPath}`);
}
