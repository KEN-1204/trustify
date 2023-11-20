export const getPlanName = (subscription: string | null | undefined) => {
  if (!subscription) return 0;
  switch (subscription) {
    case "business_plan":
      return "ビジネスプラン";
      break;
    case "premium_plan":
      return "プレミアムプラン";
      break;
    default:
      return "プラン無し";
      break;
  }
};
