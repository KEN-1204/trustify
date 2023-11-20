export const getPrice = (subscription: string | null | undefined) => {
  if (!subscription) return 0;
  switch (subscription) {
    case "business_plan":
      return 980;
      break;
    case "premium_plan":
      return 19800;
      break;
    default:
      return 0;
      break;
  }
};
