import * as z from 'zod'

// Room form validation schema
export const roomSchema = z.object({
  description: z.string().optional(),
  price: z.string()
    .min(1, 'Price is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Valid price required'
    ),
  bhkType: z.string().min(1, 'BHK type is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  locality: z.string().min(1, 'Locality is required'),
  address: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
})

// Export the TypeScript type
export type RoomFormData = z.infer<typeof roomSchema>

// BHK types constant (reusable)
export const bhkTypes = [
  "1 RK",
  "PG", 
  "Studio",
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "Other"
] as const