import crypto from 'crypto';

const algorithm = 'aes-128-cbc';

export function encryptBuffer(buffer: Buffer, key: string): Buffer {
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Prepend IV to encrypted data
  return Buffer.concat([iv, encrypted]);
}

export function decryptBuffer(encryptedBuffer: Buffer, key: string): Buffer {
  const keyBuffer = Buffer.from(key, 'hex');
  
  // Extract IV (first 16 bytes) and encrypted data
  const iv = encryptedBuffer.slice(0, 16);
  const encrypted = encryptedBuffer.slice(16);
  
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted;
}

export function getEncryptionKey(): string | null {
  return process.env.IMAGE_ENCRYPTION_KEY || null;
}