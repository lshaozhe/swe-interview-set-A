// INTERVIEWER-ANNOTATION-START
// [SA-09 · T2 · maintainability] A shared response schema exists but is not used by the server or the client; two data-access styles (raw and parameterised) coexist.
//     Look near: export const reportSchema
// INTERVIEWER-ANNOTATION-END
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
