export const includesAllProperties = (obj: { [key: string]: any } | undefined, properties: string[]): boolean => {
  if (!obj) return false;
  const keys = Object.keys(obj);
  return properties.every((property) => keys.includes(property));
};
