const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const Property = require("../src/models/property.model");

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".svg":
      return "image/svg+xml";
    default:
      return null;
  }
};

const isDataUrl = (value = "") => value.startsWith("data:");

const isLocalUploadPath = (value = "") =>
  value.startsWith("/uploads/") || value.startsWith("uploads/");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("Please set MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to DB");

  const properties = await Property.find({}).select("_id imageUrl");
  console.log(`Found ${properties.length} properties`);

  let updated = 0;
  let skipped = 0;

  for (const prop of properties) {
    const imageUrl = prop.imageUrl || "";

    if (!imageUrl || isDataUrl(imageUrl)) {
      skipped++;
      continue;
    }

    if (!isLocalUploadPath(imageUrl)) {
      skipped++;
      continue;
    }

    const relativePath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
    const filePath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(filePath)) {
      console.warn(`Missing file for property ${prop._id}: ${filePath}`);
      skipped++;
      continue;
    }

    const mimeType = getMimeType(filePath);
    if (!mimeType) {
      console.warn(`Unsupported file type for property ${prop._id}: ${filePath}`);
      skipped++;
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    await Property.updateOne({ _id: prop._id }, { $set: { imageUrl: dataUrl } });
    updated++;
  }

  console.log(`Updated ${updated} properties, skipped ${skipped}`);
  await mongoose.disconnect();
  console.log("Done");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
