import { createWriteStream, promises as fs } from "node:fs";
import { basename } from "node:path";
import { get } from "node:https";

async function download(url, destination) {
  await fs.mkdir(destination.split("/").slice(0, -1).join("/"), { recursive: true });
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location, destination).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`${response.statusCode} ${url}`));
        return;
      }
      const file = createWriteStream(destination);
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    }).on("error", reject);
  });
}

const assetMapPath = new URL("./asset_map.json", import.meta.url);
const assetMap = JSON.parse(await fs.readFile(assetMapPath, "utf8"));

for (const [id, asset] of Object.entries(assetMap)) {
  const originalUrl = asset.url;
  if (!originalUrl || !/^https?:\/\//.test(originalUrl)) continue;
  const fileName = `${id}_${basename(new URL(originalUrl).pathname)}`;
  const localPath = `assets/${fileName}`;
  console.log(`Downloading ${id}`);
  await download(originalUrl, new URL(localPath, import.meta.url).pathname);
  asset.original_url = originalUrl;
  asset.url = localPath;
}

await fs.mkdir(new URL("./vendor", import.meta.url), { recursive: true });
await download(
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  new URL("./vendor/three.min.js", import.meta.url).pathname
);

await fs.writeFile(assetMapPath, JSON.stringify(assetMap, null, 2));
console.log("Done.");
