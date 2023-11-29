import { includesAllProperties } from "./includesAllProperties";

export const checkPreviousAttributes = (
  previousAttributes: { [key: string]: any } | undefined,
  requiredProperties: string[]
): boolean => {
  return includesAllProperties(previousAttributes, requiredProperties);
};

// requiredProperties = ["current_period_end", "current_period_start", "items", "latest_invoice", "quantity"]
