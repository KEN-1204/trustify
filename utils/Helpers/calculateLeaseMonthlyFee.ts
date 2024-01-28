import Decimal from "decimal.js";
import { isValidNumber } from "./isValidNumber";

// 売上総額とリース料率から月額リース料を算出する関数
export const calculateLeaseMonthlyFee = (
  _amount: number | string,
  _rate: number | string,
  _decimalPlaces: number = 0
) => {
  if (!isValidNumber(_amount)) {
    return { monthlyFee: null, error: "無効な合計金額です。数値を入力してください。" };
  }
  if (!isValidNumber(_rate)) {
    return { monthlyFee: null, error: "無効な料率です。数値を入力してください。" };
  }

  try {
    let monthlyFee = new Decimal(0);
    const amountPrice = new Decimal(_amount || 0);
    // _rateは「1.8」や「1.6」などの%表記で取得するため、0.018や0.016に変換
    const rate = new Decimal(_rate || 0).dividedBy(100);
    monthlyFee = amountPrice.times(rate);

    return { monthlyFee: monthlyFee.toFixed(_decimalPlaces, Decimal.ROUND_HALF_UP), error: null };
  } catch (error: any) {
    return { monthlyFee: null, error: "月額リース料の算出に失敗しました。" };
  }
};
