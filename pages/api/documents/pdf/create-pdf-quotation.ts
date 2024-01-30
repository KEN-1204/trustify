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
      const { width, height } = page.getSize();

      // フォントの設定
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // 見積書のタイトル
      const title = "見積書";
      page.drawText(title, {
        x: 50,
        y: height - 50,
        size: 20,
        font: font,
        color: rgb(0, 0, 0),
      });

      // 会社情報
      page.drawText("株式会社〇〇", { x: 50, y: height - 80, size: 12, font: font });
      // 他の会社情報も同様に追加

      // 顧客情報
      page.drawText("顧客名: 株式会社△△", { x: 50, y: height - 120, size: 12, font: font });
      // 他の顧客情報も同様に追加

      // 見積日付と見積番号
      page.drawText("見積日付: 2024年1月26日", { x: 50, y: height - 160, size: 12, font: font });
      page.drawText("見積番号: 123456", { x: 50, y: height - 180, size: 12, font: font });

      // 商品リストのヘッダー
      page.drawText("商品名", { x: 50, y: height - 220, size: 12, font: font });
      page.drawText("数量", { x: 150, y: height - 220, size: 12, font: font });
      page.drawText("単価", { x: 250, y: height - 220, size: 12, font: font });
      page.drawText("金額", { x: 350, y: height - 220, size: 12, font: font });

      // 商品リストのデータを追加 (仮のデータを使用)
      page.drawText("商品A", { x: 50, y: height - 240, size: 12, font: font });
      page.drawText("3", { x: 150, y: height - 240, size: 12, font: font });
      page.drawText("¥1,000", { x: 250, y: height - 240, size: 12, font: font });
      page.drawText("¥3,000", { x: 350, y: height - 240, size: 12, font: font });

      // 合計金額
      page.drawText("合計: ¥3,000", { x: 50, y: height - 280, size: 12, font: font });

      // 有効期限と備考欄
      page.drawText("有効期限: 2024年2月26日", { x: 50, y: height - 320, size: 12, font: font });
      page.drawText("備考:", { x: 50, y: height - 340, size: 12, font: font });

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
