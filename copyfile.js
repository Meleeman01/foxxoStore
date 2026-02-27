const fs = require("fs/promises");
const path = require('path');
async function trimLastLines(filePath, linesToRemove = 3) {
  let content = await fs.readFile(filePath, "utf8");

  const arr = content.split("\n");

  // Remove last N lines
  arr.splice(-linesToRemove);

  const newContent = arr.join("\n");

  await fs.writeFile(filePath, newContent, "utf8");

  console.log(`Removed last ${linesToRemove} lines from ${filePath}`);
}
async function getFileStats(filepath) {
  try {
    const stats = await fs.stat(filepath);
    // stats.isFile(); // true
    // stats.isDirectory(); // false
    // stats.isSymbolicLink(); // false
    // console.log(stats.size); // 1024000 //= 1MB
    return stats;
  } catch (err) {
    console.log(err);
  }
}
async function main() {
  const modulePath = process.argv[2];   // e.g. "three/build/three.module.js"
  const destPath = process.argv[3] || "public/js/";

  if (!modulePath) {
    console.error("Usage: node copy-file.js <module/file> [destFolder or destPath]");
    process.exit(1);
  }

  const src =  await path.resolve("node_modules", modulePath);
  const dest = await path.resolve(destPath);
  const getStats = await getFileStats(destPath);
  console.log(destPath,dest)
 // console.log(path.basename(modulePath),path.basename(destPath));
 
  console.log(path.dirname(destPath));
  //this is clearly a mess but works
  if (!getStats) {
    console.log('file doesnt exist yet')
    await fs.mkdir(path.resolve(path.dirname(destPath)), { recursive: true });
    await fs.copyFile(src, path.join(path.dirname(dest),path.basename(modulePath)));
    //file doesn't exist but keep going lol
    await fs.rename(path.join(path.dirname(dest),path.basename(modulePath)),path.join(path.dirname(destPath),path.basename(destPath)))
    //specific code for toastify.js rename. might be brittle since it just removes the export lines
    //await trimLastLines(path.resolve(destPath))
  }
  else if (path.basename(destPath) !== path.basename(modulePath) && getStats.isFile()) {
    await fs.mkdir(path.resolve(path.dirname(destPath)), { recursive: true });
    await fs.copyFile(src, path.join(path.dirname(dest),path.basename(modulePath)));
    await fs.rename(path.resolve(dest),path.join(path.dirname(destPath),path.basename(destPath)))
    //specific code for toastify.js rename. might be brittle since it just removes the export lines
    //await trimLastLines(path.resolve(destPath))
  }
  else {
    await fs.mkdir(path.resolve(path.dirname(destPath)), { recursive: true });
    await fs.copyFile(src, path.resolve(dest,path.basename(modulePath)));
  }

  console.log(`Copied: ${src} → ${destPath}`);
}

main().catch(e => console.error(e));
