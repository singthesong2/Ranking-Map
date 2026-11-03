import { z } from "zod";

const commonFields = {
  id: z.string().min(1).max(512),
  label: z.string().trim().min(1).max(120),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  searchedAt: z.number().int().nonnegative(),
};

export const searchHistoryItemSchema = z.discriminatedUnion("kind", [
  z.object({
    ...commonFields,
    kind: z.literal("region"),
  }),
  z.object({
    ...commonFields,
    kind: z.literal("restaurant"),
    radius: z.number().int().min(500).max(5000),
  }),
]);

export const savedSearchHistorySchema = z.object({
  history: z.array(searchHistoryItemSchema).max(20),
});

export type SearchHistoryItem = z.infer<typeof searchHistoryItemSchema>;

export type NewSearchHistory =
  | Omit<Extract<SearchHistoryItem, { kind: "region" }>, "id" | "searchedAt">
  | Omit<
      Extract<SearchHistoryItem, { kind: "restaurant" }>,
      "id" | "searchedAt"
    >;
