import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Vui lòng nhập Username hoặc Email" }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
  rememberMe: z.boolean().optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
