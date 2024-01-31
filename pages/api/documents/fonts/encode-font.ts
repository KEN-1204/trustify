// pages/api/fonts.js
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === "POST") {
    try {
      // NotoSerifJP-Regular.ttfの読み込み
      const regularFontPath = path.resolve("./fonts/NotoSerifJP-Regular.otf");
      const regularFontData = fs.readFileSync(regularFontPath);
      const base64RegularFont = Buffer.from(regularFontData).toString("base64");

      // NotoSerifJP-SemiBold.ttfの読み込み
      const semiBoldFontPath = path.resolve("./fonts/NotoSerifJP-SemiBold.otf");
      const semiBoldFontData = fs.readFileSync(semiBoldFontPath);
      const base64SemiBoldFont = Buffer.from(semiBoldFontData).toString("base64");

      // NotoSerifJP-Bold.ttfの読み込み
      const boldFontPath = path.resolve("./fonts/NotoSerifJP-Bold.otf");
      const boldFontData = fs.readFileSync(boldFontPath);
      const base64BoldFont = Buffer.from(boldFontData).toString("base64");

      console.log("✅フォントの読み込み成功");
      // Base64エンコードされた両方のフォントデータをJSONとして返す
      res.status(200).json({
        base64RegularFont: base64RegularFont,
        base64SemiBoldFont: base64SemiBoldFont,
        base64BoldFont: base64BoldFont,
      });
    } catch (error: any) {
      console.log("❌フォントの読み込みに失敗しました。", error);
      res.status(500).json({ error: "フォントの読み込みに失敗しました。" });
    }
  } else {
    console.log("❌許可されていないメソッドです。");
    res.status(405).json({ error: "許可されていないメソッドです。" });
  }
}
