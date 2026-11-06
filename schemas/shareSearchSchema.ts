import { z } from "zod";

export const shareSearchSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  radius: z.number().int().min(100).max(5000).optional().catch(undefined),
  category: z
    .enum([
      "all",
      "korean",
      "chinese",
      "japanese",
      "western",
      "meat",
      "shabu",
      "mala",
      "chicken",
      "burger",
      "curry",
      "southeastAsian",
      "cafe",
      "bar",
    ])
    .optional()
    .catch(undefined),
  sort: z
    .enum(["recommended", "rating", "reviews", "distance"])
    .optional()
    .catch(undefined),
});

export type ShareSearch = z.infer<typeof shareSearchSchema>;
