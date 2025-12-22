import { z } from 'zod'


export const companySchema = z.object({
name: z.string().min(2, 'Минимум 2 символа'),
description: z.string().min(5),
})