import { z } from "zod";

// Validate biến môi trường public để tránh lỗi khi deploy.
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .default("http://localhost:8888/api/v1"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export const clientEnv: ClientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8888/api/v1",
});

// Schema riêng cho biến server chỉ truy cập trên backend.
const serverEnvSchema = z.object({
  API_SECRET_KEY: z.string().min(1),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

// Chỉ gọi hàm này trên server để lấy biến bí mật đã validate.
export function loadServerEnv(): ServerEnv | null {
  if (typeof window !== "undefined") {
    throw new Error("loadServerEnv can only be used on the server");
  }

  const result = serverEnvSchema.safeParse({
    API_SECRET_KEY: process.env.API_SECRET_KEY,
  });

  if (!result.success) {
    const message = result.error.flatten().fieldErrors;
    if (process.env.NODE_ENV !== "development") {
      throw new Error(`Invalid server environment variables: ${JSON.stringify(message)}`);
    }

    console.warn("[env] Missing server environment variables", message);
    return null;
  }

  return result.data;
}
