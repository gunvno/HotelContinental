"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useKeycloakAuth } from "@/providers/keycloak-auth-provider";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userInfo = useAuthStore((state) => state.userInfo);
  const { logout } = useKeycloakAuth(); // Use Keycloak logout instead of store logout

  // Nếu là trang login, hiển thị nội dung full màn hình (không có sidebar/header)
  if (pathname === "/login") {
    // Chúng ta có thể bao bọc thêm div nếu cần style riêng cho container login
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
            Hotel Admin
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <Link
            href="/"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname === "/"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname === "/admin"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Danh mục tổng quan</span>
          </Link>

          <Link
            href="/admin/room-types"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname.startsWith("/admin/room-types")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Loại phòng</span>
          </Link>

          <Link
            href="/admin/amenities"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname.startsWith("/admin/amenities")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Tiện nghi</span>
          </Link>

          <Link
            href="/admin/amenity-rooms"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname.startsWith("/admin/amenity-rooms")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Tiện nghi - loại phòng</span>
          </Link>

          <Link
            href="/admin/room-type-services"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname.startsWith("/admin/room-type-services")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Dịch vụ - loại phòng</span>
          </Link>

          <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Quản lý
          </div>

          <Link
            href="/rooms"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname.startsWith("/rooms")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Phòng</span>
          </Link>

          <Link
            href="/bookings"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname.startsWith("/bookings")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Đặt phòng</span>
          </Link>

          <Link
            href="/users"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname.startsWith("/users")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Người dùng</span>
          </Link>

          <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Hệ thống
          </div>

          <Link
            href="/settings"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
              pathname.startsWith("/settings")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">Cài đặt</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              {userInfo?.username?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userInfo?.fullName || userInfo?.username || "Admin User"}
              </p>
              <div className="flex justify-between items-center">
                 <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userInfo?.email || "admin@system.com"}
                 </p>
              </div>
               <button 
                  onClick={() => logout()}
                  className="text-xs text-red-500 hover:text-red-700 mt-1 font-medium bg-transparent border-none p-0 cursor-pointer"
                >
                  Đăng xuất
                </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm z-10">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            {getPathTitle(pathname)}
          </h1>
          <div className="flex items-center space-x-4">
            {/* Notification Bell or other items could go here */}
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Helper to get title based on path
function getPathTitle(pathname: string) {
    if (pathname === "/") return "Dashboard Overview";
    if (pathname.startsWith("/rooms")) return "Quản lý Phòng";
    if (pathname === "/admin") return "Quản lý Danh mục";
    if (pathname.startsWith("/admin/room-types")) return "Quản lý Loại phòng";
    if (pathname.startsWith("/admin/amenities")) return "Quản lý Tiện nghi";
    if (pathname.startsWith("/admin/amenity-rooms")) return "Quản lý Tiện nghi - Loại phòng";
    if (pathname.startsWith("/admin/room-type-services")) return "Quản lý Dịch vụ - Loại phòng";
    if (pathname.startsWith("/bookings")) return "Quản lý Đặt phòng";
    if (pathname.startsWith("/users")) return "Quản lý Người dùng";
    if (pathname.startsWith("/settings")) return "Cài đặt Hệ thống";
    return "Hotel Admin";
}
