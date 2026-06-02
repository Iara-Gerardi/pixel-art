import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  let tmpPath: string | null = null;

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const rows = parseInt(formData.get("rows") as string, 10);
    const cols = parseInt(formData.get("cols") as string, 10);
    const threshold = parseInt((formData.get("threshold") as string) ?? "128", 10);
    const invert = (formData.get("invert") as string) === "true";

    if (!imageFile || isNaN(rows) || isNaN(cols)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rows <= 0 || rows > 512 || cols <= 0 || cols > 512) {
      return NextResponse.json({ error: "rows and cols must be between 1 and 512" }, { status: 400 });
    }

    if (threshold < 0 || threshold > 255) {
      return NextResponse.json({ error: "threshold must be between 0 and 255" }, { status: 400 });
    }

    // Validate MIME type
    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/bmp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({ error: "Unsupported image format" }, { status: 400 });
    }

    // Write uploaded file to a temp path
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = imageFile.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") ?? "png";
    tmpPath = join(tmpdir(), `pixelate-${randomUUID()}.${ext}`);
    await writeFile(tmpPath, buffer);

    // Inline jimp processing (mirrors pixelate-image.js logic)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jimpModule = require("jimp");
    const JimpClass = jimpModule.Jimp ?? jimpModule.default ?? jimpModule;

    const image = await JimpClass.read(tmpPath);

    try {
      image.resize({ w: cols, h: rows });
    } catch {
      image.resize(cols, rows);
    }

    try {
      image.greyscale();
    } catch {
      image.grayscale();
    }

    function intToRGBA(i: number) {
      return {
        r: (i >>> 24) & 0xff,
        g: (i >>> 16) & 0xff,
        b: (i >>> 8) & 0xff,
        a: i & 0xff,
      };
    }

    const grid: number[][] = [];
    for (let y = 0; y < rows; y++) {
      const row: number[] = [];
      for (let x = 0; x < cols; x++) {
        const hex = image.getPixelColor(x, y);
        let brightness: number;
        if (typeof hex === "object" && hex !== null) {
          brightness = (hex as { r: number }).r;
        } else {
          brightness = intToRGBA(hex as number).r;
        }
        if (invert) brightness = 255 - brightness;
        row.push(brightness < threshold ? 1 : 0);
      }
      grid.push(row);
    }

    return NextResponse.json({ grid });
  } catch (err) {
    console.error("Pixelate error:", err);
    return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
  } finally {
    if (tmpPath) {
      unlink(tmpPath).catch(() => {});
    }
  }
}
