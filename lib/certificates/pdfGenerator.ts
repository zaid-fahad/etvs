import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import axios from "axios";
// Source - https://stackoverflow.com/q
// Posted by Alissa
// Retrieved 2025-11-20, License - CC BY-SA 4.0

async function convertImageToBase64(picture: string): Promise<string | null> {
  try {
      const imageResponse = await axios.get(picture, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      return imageBuffer.toString('base64');
  } catch (error) {
      console.error('Error fetching image from URL:', error);
      return null; 
  }
}


export async function generateCertificatePDF({
  attendee,
  template,
}: {
  attendee: { id: string; name?: string };
  template: {
    // file: string; // base64 image
    url: string;
    name: string;
    settings: {
      textX: number;
      textY: number;
      fontSize: number;
      fontColor: string;
      qrX: number;
      qrY: number;
      qrSize: number;
      qrTransparent: boolean;
    };
  };
}): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const settings = template.settings;

      const fontPath = path.join(
        process.cwd(),
        "public/fonts/OpenSans-Regular.ttf"
      );

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0,
        font: fontPath, // <- explicitly set font here
      });

      if (!fs.existsSync(fontPath)) {
        throw new Error("Font file not found at " + fontPath);
      }
      doc.font(fontPath);

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // 2️⃣ Background image
      const templateBase64 = await convertImageToBase64(template.url);
      if (!templateBase64) throw new Error("Failed to load template image");
      const bgBuffer = Buffer.from(templateBase64, "base64");
      // const bgBuffer = Buffer.from(template.file, "base64");
      doc.image(bgBuffer, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });

      // 3️⃣ Attendee name
      doc
        .fontSize(settings.fontSize)
        .fillColor(settings.fontColor)
        .text(attendee.name ?? "Unnamed", settings.textX, settings.textY);

      // 4️⃣ QR code as PNG
      const qrURL = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-certificate/${attendee.id}`;
      const qrDataURL = await QRCode.toDataURL(qrURL, {
        margin: 0,
        width: settings.qrSize,
        color: {
          dark: "#000000",
          light: settings.qrTransparent ? "#00000000" : "#ffffff",
        },
      });

      const qrBuffer = Buffer.from(qrDataURL.split(",")[1], "base64");
      doc.image(qrBuffer, settings.qrX, settings.qrY, {
        width: settings.qrSize,
        height: settings.qrSize,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
