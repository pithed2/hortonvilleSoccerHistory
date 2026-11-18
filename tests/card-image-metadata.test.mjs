import assert from "node:assert/strict"
import { test } from "node:test"
import { hasExifMetadata, stripJpegMetadata } from "../lib/card-image-metadata.ts"

const jpeg = (...data) => Buffer.from([0xff, 0xd8, ...data, 0xff, 0xd9])
const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const pngChunk = (type, payload = Buffer.alloc(0)) => {
  const header = Buffer.alloc(8)
  header.writeUInt32BE(payload.length)
  header.write(type, 4, "ascii")
  return Buffer.concat([header, payload, Buffer.alloc(4)])
}
const webpChunk = (type, payload = Buffer.alloc(0)) => {
  const header = Buffer.alloc(8)
  header.write(type, 0, "ascii")
  header.writeUInt32LE(payload.length, 4)
  return Buffer.concat([header, payload, Buffer.alloc(payload.length % 2)])
}
const webp = (...chunks) => {
  const body = Buffer.concat([Buffer.from("WEBP"), ...chunks])
  const header = Buffer.alloc(8)
  header.write("RIFF")
  header.writeUInt32LE(body.length, 4)
  return Buffer.concat([header, body])
}

test("JPEG scan bytes mentioning Exif are not metadata", () => {
  const bytes = jpeg(0xff, 0xe0, 0, 4, 1, 2, 0xff, 0xda, 0, 2, ...Buffer.from("binary Exif eXIf data"))
  assert.equal(hasExifMetadata(bytes, "jpeg"), false)
})
test("JPEG APP1 EXIF metadata is detected", () => {
  const bytes = jpeg(0xff, 0xe1, 0, 8, ...Buffer.from("Exif\0\0"))
  assert.equal(hasExifMetadata(bytes, "jpeg"), true)
})
test("JPEG APP1 non-Exif data is allowed", () => {
  const bytes = jpeg(0xff, 0xe1, 0, 8, ...Buffer.from("plain!"))
  assert.equal(hasExifMetadata(bytes, "jpeg"), false)
})
test("PNG EXIF chunk is detected", () => {
  assert.equal(hasExifMetadata(Buffer.concat([pngHeader, pngChunk("eXIf")]), "png"), true)
})
test("PNG image payload mentioning eXIf is allowed", () => {
  assert.equal(hasExifMetadata(Buffer.concat([pngHeader, pngChunk("IDAT", Buffer.from("eXIf"))]), "png"), false)
})
test("WebP EXIF chunk is detected", () => {
  assert.equal(hasExifMetadata(webp(webpChunk("EXIF")), "webp"), true)
})
test("WebP image payload mentioning EXIF is allowed", () => {
  assert.equal(hasExifMetadata(webp(webpChunk("VP8 ", Buffer.from("EXIF"))), "webp"), false)
})

test("remove EXIF metadata while preserving compressed JPEG image data", () => {
  const scan = Buffer.from("scan data including Exif pixels")
  const input = jpeg(0xff, 0xe1, 0, 8, ...Buffer.from("Exif\0\0"), 0xff, 0xda, 0, 2, ...scan)
  const result = stripJpegMetadata(input)
  assert.equal(hasExifMetadata(result, "jpeg"), false)
  assert.equal(result.includes(scan), true)
})
test("remove JPEG XMP, IPTC and comment metadata", () => {
  const input = jpeg(0xff, 0xe1, 0, 6, ...Buffer.from("XMP!"), 0xff, 0xed, 0, 6, ...Buffer.from("IPTC"), 0xff, 0xfe, 0, 5, ...Buffer.from("Hi!"), 0xff, 0xda, 0, 2, 3)
  const result = stripJpegMetadata(input)
  assert.equal(result.includes(Buffer.from("XMP!")), false)
  assert.equal(result.includes(Buffer.from("IPTC")), false)
  assert.equal(result.includes(Buffer.from("Hi!")), false)
})
test("leave metadata-free JPEGs unchanged", () => {
  const input = jpeg(0xff, 0xe0, 0, 4, 1, 2, 0xff, 0xda, 0, 2, 3)
  assert.strictEqual(stripJpegMetadata(input), input)
})
test("reject invalid JPEG marker lengths", () => {
  assert.throws(() => stripJpegMetadata(jpeg(0xff, 0xe1, 0, 1)), /Invalid JPEG/)
})
