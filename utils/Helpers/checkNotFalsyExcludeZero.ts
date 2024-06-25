// 0は許容
export const checkNotFalsyExcludeZero = (value: any) => {
  if (value !== null && value !== undefined && value !== "") {
    return true;
  } else {
    return false;
  }
};
