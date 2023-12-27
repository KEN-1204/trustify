// 論理否定で0のみ許容する関数

export const invertFalsyExcludeZero = (value: any): boolean => {
  return value === 0 ? value : !value;
};
