// // pdf-libを使用したPDFの生成
// import { NextApiRequest, NextApiResponse } from "next";
// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// import fontkit from "@pdf-lib/fontkit";
// import path from "path";
// import fs from "fs";

// export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
//   if (req.method === "POST") {
//     try {
//       // pdfドキュメントの新規作成
//       const pdfDoc = await PDFDocument.create();

//       // FontkitをPDFドキュメントに登録
//       // pdf-libにfontkitを登録して、カスタムフォントをPDFに埋め込み可能にする
//       pdfDoc.registerFontkit(fontkit);

//       // フォントの設定
//       // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//       // フォントファイルの読み込み path.resolve():与えられたパスのシーケンスを絶対パスに変換
//       // const fontPath = path.resolve("./fonts/Roboto-Regular.ttf");
//       // const fontPath = path.resolve("./fonts/NotoSansJP-Regular.ttf");
//       // const fontPath = path.resolve("./fonts/NotoSerifJP-Regular.otf");
//       // const fontPath = path.resolve("./fonts/NotoSerifJP-Medium.otf");
//       // const fontPath = path.resolve("./fonts/NotoSerifJP-SemiBold.otf");//🌠
//       const fontPath = path.resolve("./fonts/NotoSerifJP-Bold.otf"); //🌠
//       // 指定されたダイルを同期的に読み込みそのファイル内容をバッファ、または文字列として返す
//       const fontBytes = fs.readFileSync(fontPath);
//       // PDFドキュメントにフォントを追加 *1
//       // const font = await pdfDoc.embedFont(fontBytes, { subset: true });
//       const font = await pdfDoc.embedFont(fontBytes);

//       // 新しいページを追加
//       const page = pdfDoc.addPage();
//       // ページのサイズ設定(A4サイズ)
//       const { width, height } = page.getSize();

//       // ページにテキストを描画

//       // 見積書のタイトル
//       const title = "見積書";
//       page.drawText(title, {
//         x: 50,
//         y: height - 50,
//         size: 20,
//         font: font,
//         color: rgb(0, 0, 0),
//       });

//       // 会社情報
//       page.drawText("株式会社〇〇", { x: 50, y: height - 80, size: 12, font: font });
//       // 他の会社情報も同様に追加

//       // 顧客情報
//       page.drawText("顧客名: 株式会社△△", { x: 50, y: height - 120, size: 12, font: font });
//       // 他の顧客情報も同様に追加

//       // 見積日付と見積番号
//       page.drawText("見積日付: 2024年1月26日", { x: 50, y: height - 160, size: 12, font: font });
//       page.drawText("見積番号: 123456", { x: 50, y: height - 180, size: 12, font: font });

//       // 商品リストのヘッダー
//       page.drawText("商品名", { x: 50, y: height - 220, size: 12, font: font });
//       page.drawText("数量", { x: 150, y: height - 220, size: 12, font: font });
//       page.drawText("単価", { x: 250, y: height - 220, size: 12, font: font });
//       page.drawText("金額", { x: 350, y: height - 220, size: 12, font: font });

//       // 商品リストのデータを追加 (仮のデータを使用)
//       page.drawText("商品A", { x: 50, y: height - 240, size: 12, font: font });
//       page.drawText("3", { x: 150, y: height - 240, size: 12, font: font });
//       page.drawText("¥1,000", { x: 250, y: height - 240, size: 12, font: font });
//       page.drawText("¥3,000", { x: 350, y: height - 240, size: 12, font: font });

//       // 合計金額
//       page.drawText("合計: ¥3,000", { x: 50, y: height - 280, size: 12, font: font });

//       // 有効期限と備考欄
//       page.drawText("有効期限: 2024年2月26日", { x: 50, y: height - 320, size: 12, font: font });
//       page.drawText("備考:", { x: 50, y: height - 340, size: 12, font: font });

//       // PDFをバイナリとしてシリアライズ
//       const pdfBytes = await pdfDoc.save();

//       // PDFバイトをクライアントに送信
//       res.setHeader("Content-Type", "application/pdf");
//       console.log(
//         "✅PDF生成成功 setHeaderでContent-Typeをapplication/pdfに設定して、res.endでデータをレスんポンスしてストリームを閉じる"
//       );
//       // res.send(pdfBytes);
//       // res.send()だと送信されるデータのタイプを自動的に検出して、適切なContent-Typeヘッダーを設定するため、
//       // 特殊なapplication/pdfは正しく識別できずにデフォルトのContent-Typeのapplication/jsonを適用してしまう。
//       // res.send(pdfBytes);
//       // res.end()にすることで最後にデータを送信しレスポンスストリームを直接終了させるので、データタイプの自動検出や変更が行われないため、res.setHeaderでContent-Typeを手動で設定する場合にはres.end()を使用する
//       res.end(pdfBytes);
//     } catch (error: any) {
//       console.log("❌PDF生成中にエラーが発生しました。", error);
//       res.status(500).json({ error: error.message });
//     }
//   } else {
//     console.log("❌許可されていないメソッドです。");
//     res.status(405).json({ error: "許可されていないメソッドです。" });
//   }
// }

// /*
// *1
// pdfDoc.embedFont(fontBytes, { subset: true }) における { subset: true } オプションは、PDF ドキュメントにフォントのサブセットを埋め込むように pdf-lib に指示します。このオプションを使用すると、PDF に必要なフォントの一部（つまり、使用されている文字のみ）が含まれるため、PDF ファイルのサイズを小さくすることができます。

// サブセット埋め込みの利点
// ファイルサイズの削減：フォントの全体ではなく、実際に使用されている文字だけをPDFに含めるため、ファイルサイズが小さくなります。
// パフォーマンス向上：PDFファイルのサイズが小さくなることで、ファイルのダウンロードや表示が速くなる場合があります。
// 注意点
// カスタムフォントの場合：特にカスタムフォントを使用する場合、フォントファイルが大きいことが多いため、サブセット埋め込みは非常に有効です。
// ファイルの再利用：サブセット埋め込みを行ったPDFは、そのPDF内でのみフォントが完全に機能します。他のドキュメントで同じフォントを使用したい場合は、その文字がサブセットに含まれている必要があります。
// したがって、特にファイルサイズの削減が重要な場合や、多くの異なる文字を含む大きなフォントファイルを使用している場合は、{ subset: true } オプションを使用することを検討すると良いでしょう。

// */
