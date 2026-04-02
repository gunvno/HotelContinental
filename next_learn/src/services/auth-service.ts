import { http } from "@/lib/http";
import { type AuthContent } from "@/store/auth-store";
import { type ApiResponse } from "@/types/api-types";

export type LoginPayload = { username: string; password: string};
export type OtpRegisterPayload = { email: string };
export type OtpVerifyPayload = { 
  email: string; 
  inputOtp: string; 
  expectedType: "REGISTER" | "FORGOT_PASSWORD"; 
};

export type RegisterPayload = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

// --- API Functions ---

export async function login(payload: LoginPayload) {
  const res = await http.post("auth/login", { json: payload }).json<ApiResponse<AuthContent>>();
  return res.result ?? res.content;
}

// 1. Gửi OTP đến email (@PostMapping("/otp-register"))
export async function otpRegister(payload: OtpRegisterPayload) {
  // Backend trả về ApiResponse<Void>
  const res = await http
    .post("identity/auth/otp-register", { json: payload })
    .json<ApiResponse<void>>();
  return res.success;
}

// 2. Xác thực OTP (@PostMapping("/otp-verify"))
export async function otpVerify(payload: OtpVerifyPayload) {
  // Backend trả về ApiResponse<Boolean>
  const res = await http
    .post("identity/auth/otp-verify", { json: payload })
    .json<ApiResponse<boolean>>();
  // console.log("OTP Verify Result:", res.result);
  return res.result; // Trả về true/false
}

// 3. Đăng ký tài khoản (@PostMapping("/register"))
export async function registerUser(payload: RegisterPayload) {
  // Backend trả về ApiResponse<String> (userId)
  const res = await http
    .post("identity/auth/register", { json: payload })
    .json<ApiResponse<string>>();
  // console.log("Registered User ID:", res.result);
  return res.result;
}
