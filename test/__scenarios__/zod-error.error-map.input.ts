import { z } from 'zod'

export default function setZodLocale() {
  const customErrorMap: z.ZodErrorMap = () => {
    return { message: 'Custom error message' }
  }

  z.setErrorMap(customErrorMap)
}