import { QuotationProductsDetail } from "@/types";
import Decimal from "decimal.js";

// 見積商品リストの価格合計を計算する関数
export const calculateTotalPriceProducts = (products: QuotationProductsDetail[], decimalPlaces: number = 0) => {
  let total = new Decimal(0);
  products.forEach((product) => {
    const unitPrice = new Decimal(product.quotation_product_unit_price || 0);
    const quantity = new Decimal(product.quotation_product_quantity || 0);
    total = total.plus(unitPrice.times(quantity));
  });
  return total.toFixed(decimalPlaces, Decimal.ROUND_HALF_UP); // デフォルトでは小数点以下0桁に丸める
};
