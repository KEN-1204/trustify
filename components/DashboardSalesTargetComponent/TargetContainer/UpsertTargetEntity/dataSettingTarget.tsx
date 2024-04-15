const descriptionGuide = [
  {
    title: "正確なデータ分析と評価",
    content:
      "営業稼働日と休業日を設定しておくことで、年度・月度ごとの稼働日に基づいた適切な面談・デモ件数、TELPR件数の目標設定と各プロセスの結果に基づく正確な評価・分析が可能となります。\nまた、稼働日を年度ごとに設定することで、各営業テリトリーの過去比較を行う際に稼働日も考慮した正確な分析が可能です。",
  },
  {
    title: "PDFダウンロード",
    content:
      "登録した営業カレンダーは右側のダウンロードアイコンからPDF形式でダウンロードが可能です。\nサイズはA4〜A7サイズの範囲で変更が可能です。",
  },
  {
    title: "印刷",
    content:
      "営業カレンダーを印刷して各メンバーの手帳に入れておくことで、お客様との商談で自社の営業締日ベースでのスケジュールの擦り合わせなどで活用頂けます。\nサイズはA4〜A7サイズの範囲で変更が可能です。",
  },
];

export const mappingDescriptions: { [key: string]: { [key: string]: string }[] } = {
  guide: descriptionGuide,
  //   step: descriptionSteps,
  //   compressionRatio: descriptionCompressionRatio,
  //   printTips: descriptionPrintTips,
};

export const mappingPopupTitle: { [key: string]: { [key: string]: string } } = {
  settingSalesTarget: { en: "Sales Target", ja: "売上目標" },
  settingSalesTargetEntity: { en: "Fiscal Year", ja: "会計年度" },
  periodType: { en: "Period", ja: "期間" },
  step: { en: `Step`, ja: `目標設定 手順` },
};
