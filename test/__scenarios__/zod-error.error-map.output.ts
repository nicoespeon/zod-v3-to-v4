import { z } from 'zod/v4'

export default function setZodLocale() {
  const customErrorMap: z.core.$ZodErrorMap = () => {
    return { message: 'Custom error message' }
  }

  z.config({customError: customErrorMap})
}