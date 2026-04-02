import { z } from "zod";

export const profileSchema = z.object({
  gender: z.enum(["Male", "Female", "Other", "Unknown"], {
    errorMap: () => ({ message: "Vui lòng chọn giới tính hợp lệ." }),
  }),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Ngày sinh không hợp lệ.",
  }),
  address: z.string().min(5, "Địa chỉ phải đủ chi tiết (ít nhất 5 ký tự)."),
  phoneNumber: z.string().regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ."),
  identityNumber: z.string().min(9, "Số CMND/CCCD phải có ít nhất 9 số."),
});

// The form data type inferred from schema
export type ProfileSchema = z.infer<typeof profileSchema>;
