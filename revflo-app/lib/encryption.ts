import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getEncryptionKey(): Buffer {
    const keyString = process.env.INTEGRATION_ENCRYPTION_KEY
    if (!keyString) {
        throw new Error('INTEGRATION_ENCRYPTION_KEY environment variable is not set')
    }

    // Convert hex or base64 to buffer. If raw 32 char string, convert to buffer.
    let key: Buffer
    if (keyString.length === 64) {
        key = Buffer.from(keyString, 'hex')
    } else if (keyString.length === 44 && keyString.endsWith('=')) {
        key = Buffer.from(keyString, 'base64')
    } else {
        key = Buffer.from(keyString)
    }

    if (key.length !== 32) {
        throw new Error('INTEGRATION_ENCRYPTION_KEY must be exactly 32 bytes (256 bits)')
    }
    return key
}

export function encryptToken(text: string): string {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    // Store as: iv:authTag:encryptedText
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptToken(encryptedString: string): string {
    const key = getEncryptionKey()
    const [ivHex, authTagHex, encryptedHex] = encryptedString.split(':')

    if (!ivHex || !authTagHex || !encryptedHex) {
        throw new Error('Invalid encrypted token format')
    }

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const encryptedText = Buffer.from(encryptedHex, 'hex')

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()])
    return decrypted.toString('utf8')
}
