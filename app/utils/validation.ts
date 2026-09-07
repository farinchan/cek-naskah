import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Alamat email wajib diisi')
    .email('Format alamat email tidak valid'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi')
    .min(8, 'Kata sandi minimal harus 8 karakter')
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Nama lengkap wajib diisi')
      .min(2, 'Nama lengkap minimal 2 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    email: z
      .string()
      .trim()
      .min(1, 'Alamat email wajib diisi')
      .email('Format alamat email tidak valid'),
    phone: z
      .string()
      .trim()
      .min(1, 'Nomor telepon wajib diisi')
      .refine(val => /^(\+62|62|0)[0-9]{9,13}$/.test(val.replace(/[\s-]/g, '')), {
        message: 'Format nomor telepon tidak valid (contoh: 081234567890)'
      }),
    password: z
      .string()
      .min(1, 'Kata sandi wajib diisi')
      .min(8, 'Kata sandi minimal harus 8 karakter sesuai aturan Appwrite'),
    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi kata sandi wajib diisi'),
    agreeTerms: z
      .boolean()
      .refine(val => val === true, {
        message: 'Anda harus menyetujui syarat dan ketentuan layanan'
      })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi',
    path: ['confirmPassword']
  })

export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Alamat email wajib diisi')
    .email('Format alamat email tidak valid')
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    userId: z.string().min(1, 'Token pengguna tidak valid atau hilang'),
    secret: z.string().min(1, 'Token verifikasi tidak valid atau hilang'),
    password: z
      .string()
      .min(1, 'Kata sandi baru wajib diisi')
      .min(8, 'Kata sandi baru minimal harus 8 karakter'),
    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi kata sandi baru wajib diisi')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru',
    path: ['confirmPassword']
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const authTestLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Alamat email wajib diisi')
    .email('Format alamat email tidak valid'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi')
    .min(8, 'Kata sandi minimal harus 8 karakter')
})

export const authTestRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama wajib diisi untuk registrasi')
    .min(2, 'Nama minimal 2 karakter'),
  email: z
    .string()
    .trim()
    .min(1, 'Alamat email wajib diisi')
    .email('Format alamat email tidak valid'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi')
    .min(8, 'Kata sandi minimal harus 8 karakter')
})

export const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Alamat email wajib diisi')
    .email('Format email tidak valid')
})

export type SubscribeInput = z.infer<typeof subscribeSchema>

/**
 * Extracts the first error message for each field from a ZodError
 */
export const extractZodErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (field !== undefined && !errors[String(field)]) {
      errors[String(field)] = issue.message
    }
  }
  return errors
}
