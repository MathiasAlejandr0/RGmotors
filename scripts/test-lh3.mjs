import https from "node:https";
import { createWriteStream } from "node:fs";

function downloadGoogleDriveImage(fileId, dest) {
  const url = `https://lh3.googleusercontent.com/d/${fileId}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return https.get(res.headers.location, (res2) => {
          const stream = createWriteStream(dest);
          res2.pipe(stream);
          stream.on("finish", () => {
            stream.close();
            resolve(true);
          });
          stream.on("error", reject);
        });
      }
      const stream = createWriteStream(dest);
      res.pipe(stream);
      stream.on("finish", () => {
        stream.close();
        resolve(true);
      });
      stream.on("error", reject);
    }).on("error", reject);
  });
}

async function test() {
  const fileId = "1snu4313FB99SSWS6dwmiPrTqWT3qG5d4"; // Captiva folder or photo
  // Let's test with a real photo file ID from CVFF32
  const photoId = "1F__Z4fJT1XmtwvzAGRn90MQS2uwrDStm";
  await downloadGoogleDriveImage(photoId, "scratch/test_photo.jpg");
  console.log("Photo downloaded successfully!");
}

test().catch(console.error);
