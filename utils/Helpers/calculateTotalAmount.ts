import Decimal from "decimal.js";

// 価格合計から値引合計を引いた総額を算出する関数
export const calculateTotalAmount = (total: number, discount: number, decimalPlaces: number = 0) => {
  let amount = new Decimal(0);
  const totalPrice = new Decimal(total || 0);
  const discountAmount = new Decimal(discount || 0);
  amount = totalPrice.minus(discountAmount);

  return amount.toFixed(decimalPlaces, Decimal.ROUND_HALF_UP);
};
