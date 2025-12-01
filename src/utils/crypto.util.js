const crypto = require('crypto');

function getKey() {
  const raw = process.env.CARD_ENC_KEY || process.env.JWT_SECRET || '';
  // Derive a 32-byte key from provided secret
  return crypto.createHash('sha256').update(String(raw)).digest();
}

exports.encryptGCM = function encryptGCM(plainText) {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipherText: enc.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
};

exports.decryptGCM = function decryptGCM(cipherText, iv, tag) {
  const key = getKey();
  const ivBuf = Buffer.from(String(iv), 'base64');
  const tagBuf = Buffer.from(String(tag), 'base64');
  const encBuf = Buffer.from(String(cipherText), 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuf);
  decipher.setAuthTag(tagBuf);
  const dec = Buffer.concat([decipher.update(encBuf), decipher.final()]);
  return dec.toString('utf8');
};
