import { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument, StandardFonts } from "pdf-lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === "POST") {
    try {
      // 新しいPDFドキュメントを作成
      const pdfDoc = await PDFDocument.create();

      // ページを追加し、テキストを描画
      const page = pdfDoc.addPage();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawText("Hello, world!", {
        x: 50,
        y: page.getHeight() - 50,
        size: 12,
        font: font,
      });

      // PDFをバイナリデータとして保存
      const pdfBytes = await pdfDoc.save();

      // レスポンスヘッダーを設定し、PDFを送信
      console.log("✅");
      res.setHeader("Content-Type", "application/pdf");
      // res.send()だと送信されるデータのタイプを自動的に検出して、適切なContent-Typeヘッダーを設定するため、
      // 特殊なapplication/pdfは正しく識別できずにデフォルトのContent-Typeのapplication/jsonを適用してしまう。
      // res.send(pdfBytes);
      // res.end()にすることで最後にデータを送信しレスポンスストリームを直接終了させるので、データタイプの自動検出や変更が行われないため、res.setHeaderでContent-Typeを手動で設定する場合にはres.end()を使用する
      res.end(pdfBytes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "PDFの生成中にエラーが発生しました" });
    }
  } else {
    res.status(405).json({ message: "許可されていないメソッドです" });
  }
}
