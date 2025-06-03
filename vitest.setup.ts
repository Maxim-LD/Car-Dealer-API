if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = require('crypto');
}
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = (buffer: Buffer) => {
    const bytes = require('crypto').randomBytes(buffer.length);
    bytes.forEach((b, i) => buffer[i] = b);
    return buffer;
  };
}