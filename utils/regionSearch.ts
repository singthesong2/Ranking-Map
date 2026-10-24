export const normalize = (value: string) =>
  value.replace(/\s/g, "").toLowerCase();

export const removeRegionSuffix = (value: string) =>
  normalize(value).replace(/(특별자치시|특별시|광역시|시|군|면|동)$/, "");
