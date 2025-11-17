import PDFDocument from "pdfkit";
import { loadImage } from "@napi-rs/canvas";
import { QRCodeSVG } from "qrcode.react";
import React from "react";
import ReactDOMServer from "react-dom/server";

export async function generateCertificatePDF({
  attendee,
  template,
}: {
  attendee: any;
  template: any;
}) {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const settings = template.settings;

      const doc = new PDFDocument({ size: "A4", margin: 0 });

      const chunks: Buffer[] = [];
      doc.on("data", (d) => chunks.push(d));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      //
      // ---- Background Image ----
      //
      const bgBuffer = Buffer.from(template.file, "base64");
      doc.image(bgBuffer, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });

      //
      // ---- Attendee Name ----
      //
      doc
        .fontSize(settings.fontSize)
        .fillColor(settings.fontColor)
        .text(attendee.name ?? "Unnamed", settings.textX, settings.textY);

      //
      // ---- QR Code using QRCodeSVG ----
      //
      const qrURL = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-certificate/${attendee.id}`;

      // 1️⃣ Render React SVG component → SVG string
      const svgString = ReactDOMServer.renderToStaticMarkup(
        React.createElement(QRCodeSVG, {
          value: qrURL,
          size: settings.qrSize,
          bgColor: settings.qrTransparent ? "transparent" : "#ffffff",
          fgColor: "#000000",
          level: "M",
        })
      );

      // 2️⃣ Convert SVG → PNG so pdfkit can embed it
      const image = await loadImage(
        `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
          "base64"
        )}`
      );

      // Create a canvas and draw the image onto it
      const { createCanvas } = await import("@napi-rs/canvas");
      const canvas = createCanvas(settings.qrSize, settings.qrSize);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, settings.qrSize, settings.qrSize);

      const pngBuffer = canvas.toBuffer("image/png");

      // 3️⃣ Insert QR image
      doc.image(pngBuffer, settings.qrX, settings.qrY, {
        width: settings.qrSize,
        height: settings.qrSize,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
