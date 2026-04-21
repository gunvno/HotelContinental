"use client";

import { Search, Shield, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const users = [
  { id: "1", name: "Admin User", email: "admin@system.com", role: "ADMIN", status: "Active" },
  { id: "2", name: "Nguyễn Văn A", email: "a@mail.com", role: "STAFF", status: "Active" },
  { id: "3", name: "Trần Thị B", email: "b@mail.com", role: "CUSTOMER", status: "Locked" },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Danh sách tài khoản, vai trò và trạng thái hệ thống.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder="Tìm theo tên hoặc email" />
        </div>
        <Button className="bg-sky-600 text-white hover:bg-sky-500">+ Thêm người dùng</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={<UserRound className="h-4 w-4" />} title="Tổng tài khoản" value="1,245" />
        <InfoCard icon={<Shield className="h-4 w-4" />} title="Quản trị viên" value="12" />
        <InfoCard icon={<UserRound className="h-4 w-4" />} title="Người dùng bị khóa" value="8" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Vai trò</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{user.role}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Button variant="outline" size="sm">Chi tiết</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
        <span>{title}</span>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}
