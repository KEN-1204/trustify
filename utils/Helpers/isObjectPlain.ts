export function isPlainObject(obj: Object) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && !(obj instanceof Date);
}

/**
JavaScriptではオブジェクトであるかどうかをチェックするには、主にtypeof演算子を使用します。ただし、typeof演算子を使用すると、配列やnullも「object」として認識されるため、配列やnullでないことを確認する追加のチェックが必要になります。

こちらが、値がプレーンなオブジェクト（つまり、Objectの直接のインスタンス）であるかをチェックするための一般的な方法です：

この関数は、与えられた値がnullでなく、配列や日付オブジェクトでもない普通のオブジェクト（例えば {key: value} の形式）であるかをチェックします。それ以外の型（関数やクラスのインスタンスなど）もobjectとして認識されるため、さらに厳密なチェックが必要な場面ではそれに応じて関数を調整する必要があります。
 */
