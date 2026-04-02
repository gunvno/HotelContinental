import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, { message: "Username phải có ít nhất 3 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  firstName: z.string().min(1, { message: "Họ đệm là bắt buộc" }),
  lastName: z.string().min(1, { message: "Tên là bắt buộc" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string().min(6, { message: "Xác nhận mật khẩu phải có ít nhất 6 ký tự" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type RegisterSchema = z.infer<typeof registerSchema>;
