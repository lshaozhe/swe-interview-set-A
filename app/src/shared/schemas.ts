import { z } from 'zod'

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

export const reportSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.string(),
  value: z.string(),
  createdAt: z.string()
})
export type ReportDto = z.infer<typeof reportSchema>
