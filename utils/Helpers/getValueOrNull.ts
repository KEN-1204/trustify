// 空文字, undefined, nullはnullを返し、それ以外は値を返す
export const getValueOrNull = (value: any) => {
  return value === "" || value === undefined || value === null ? null : value;
};
