export type ApiResponse<T> = {
  success: boolean; // Có thể backend bạn gọi là code/message, hãy kiểm tra lại nếu cần
  errorCode: string | null;
  content: T; // Field cũ
  result: T;  // Field mới từ backend Spring Boot của bạn
};