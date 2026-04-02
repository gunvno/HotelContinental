import { Suspense } from "react";
import { ProfileForm } from "./ProfileForm";
import { Loader2 } from "lucide-react";

export default function RegisterProfilePage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2649&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Hotel Continental
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Hoàn tất hồ sơ của bạn để nhận được những ưu đãi và dịch vụ tốt nhất từ chúng tôi."
            </p>
            <footer className="text-sm">Customer Care Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <ProfileForm />
          </Suspense>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Bằng cách cập nhật hồ sơ, bạn đồng ý với{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Chính sách bảo mật
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
