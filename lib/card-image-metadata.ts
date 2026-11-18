/** Check EXIF container entries, not arbitrary compressed image bytes. */
export function hasExifMetadata(bytes: Buffer, type: "jpeg" | "png" | "webp"): boolean {
  if (type === "jpeg") {
    // JPEG metadata uses APP1 segments before the image scan starts.
    let offset = 2
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 0xff) break
      while (bytes[offset] === 0xff) offset++
      const marker = bytes[offset++]
      if (marker === 0xda || marker === 0xd9) break // Scan data or end of image.
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
      if (offset + 2 > bytes.length) break
      const length = bytes.readUInt16BE(offset)
      if (length < 2 || length > bytes.length - offset) break
      if (marker === 0xe1 && length >= 8 &&
          bytes.subarray(offset + 2, offset + 8).equals(Buffer.from("Exif\0\0", "ascii"))) return true
      offset += length
    }
    return false
  }

  if (type === "png") {
    // PNG EXIF metadata is stored in an eXIf chunk.
    let offset = 8
    while (offset + 12 <= bytes.length) {
      const length = bytes.readUInt32BE(offset)
      if (length > bytes.length - offset - 12) break
      if (bytes.toString("ascii", offset + 4, offset + 8) === "eXIf") return true
      offset += 12 + length
    }
    return false
  }

  // WebP EXIF metadata is stored in an EXIF RIFF chunk.
  let offset = 12
  while (offset + 8 <= bytes.length) {
    const length = bytes.readUInt32LE(offset + 4)
    if (length > bytes.length - offset - 8) break
    if (bytes.toString("ascii", offset, offset + 4) === "EXIF") return true
    offset += 8 + length + (length % 2)
  }
  return false
}
