//

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // pdf文書の新規作成
      const pdfDoc = await PDFDocument.create();
      // ページの追加
      const page = pdfDoc.addPage();
      // ページのサイズ設定(A4サイズ)
      const [pageWidth, pageHeight] = page.getSize();

      // PDFをバイナリとしてシリアライズ
      const pdfBytes = await pdfDoc.save();

      // PDFをクライアントに送信
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBytes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "許可されていないメソッドです。" });
  }
}
