// 13:00を13と00に分割
export const splitTime = (timeStr: string) => {
  if (!timeStr) return null;
  const [hours, minutes, seconds] = timeStr.split(":");

  return { hours: hours, minutes: minutes, seconds: seconds };
};
