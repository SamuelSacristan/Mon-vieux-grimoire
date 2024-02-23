const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');

const compressImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const webpFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.webp`);

  try {
    await sharp(filePath)
      .resize({ fit: 'cover', height: 260, width: 203 })
      .webp({ quality: 85 })
      .toFile(webpFilePath);

    req.file.path = webpFilePath;

    await fs.unlink(filePath);

    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};

module.exports = compressImage;
