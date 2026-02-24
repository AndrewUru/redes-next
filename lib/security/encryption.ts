import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

type EncryptedSecret = {
  token_ciphertext: string;
  token_iv: string;
  token_tag: string;
};

function getKeyFromEnv() {
  const rawKey = process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error("Missing INSTAGRAM_TOKEN_ENCRYPTION_KEY");
  }

  return createHash("sha256").update(rawKey).digest();
}

export function encryptSecret(secret: string): EncryptedSecret {
  const key = getKeyFromEnv();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    token_ciphertext: encrypted.toString("base64"),
    token_iv: iv.toString("base64"),
    token_tag: tag.toString("base64")
  };
}

export function decryptSecret(payload: EncryptedSecret): string {
  const key = getKeyFromEnv();
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(payload.token_iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(payload.token_tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.token_ciphertext, "base64")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}
