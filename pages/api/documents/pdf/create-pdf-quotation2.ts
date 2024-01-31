// //

// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     try {
//       // pdf文書の新規作成
//       const pdfDoc = await PDFDocument.create();
//       // ページの追加
//       const page = pdfDoc.addPage();
//       // ページのサイズ設定(A4サイズ)
//       const [pageWidth, pageHeight] = page.getSize();

//       // 会社情報の追加
//       page.drawText("会社名: 株式会社サンプル", {
//         x: 50,
//         y: pageHeight - 50,
//         size: 12,
//         color: rgb(0, 0, 0),
//       });

//       // 顧客情報の追加
//       page.drawText("顧客名: 株式会社クライアント", {
//         x: 50,
//         y: pageHeight - 70,
//         size: 12,
//       });

//       // 見積書タイトル
//       page.drawText("見積書", {
//         x: pageWidth / 2 - 50,
//         y: pageHeight - 90,
//         size: 18,
//       });

//       // 商品リストの追加
//       // 例えば、Supabaseから取得した商品リストをループして追加
//       let yPos = pageHeight - 110;
//       data.products.forEach((product) => {
//         page.drawText(`商品名: ${product.name} - 価格: ${product.price}`, {
//           x: 50,
//           y: yPos,
//           size: 10,
//         });
//         yPos -= 20;
//       });

//       // 合計金額の追加
//       page.drawText(`合計金額: ${data.totalPrice}`, {
//         x: 50,
//         y: yPos - 20,
//         size: 12,
//         color: rgb(1, 0, 0), // 赤色
//       });

//       // PDFをバイナリとしてシリアライズ
//       const pdfBytes = await pdfDoc.save();

//       // PDFをクライアントに送信
//       res.setHeader("Content-Type", "application/pdf");
//       res.send(pdfBytes);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   } else {
//     res.status(405).json({ error: "許可されていないメソッドです。" });
//   }
// }
