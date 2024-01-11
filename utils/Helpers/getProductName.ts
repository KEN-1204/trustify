// 商品名の社内向け型式が存在する場合は社内向け型式を返し、
// なければ、商品名と顧客向け型式を結合して返す

export const getProductName = (
  productName: string | null | undefined,
  insideShortName: string | null | undefined,
  outsideShortName: string | null | undefined
): string | null => {
  if (productName) {
    // 社内向け型式が存在するかチェック
    if (!insideShortName) {
      // 社内向けなしの場合は商品名＋型式を返す
      const fullProductName = productName + (outsideShortName ? outsideShortName : "");
      return fullProductName;
    } else {
      // 社内向けあり
      return insideShortName;
    }
  } else {
    return null;
  }
};
