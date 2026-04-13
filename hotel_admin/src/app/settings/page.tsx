"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt hệ thống</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Cấu hình giao diện, thông báo và thông tin vận hành.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin khách sạn</h3>
          <div className="mt-4 space-y-4">
            <Input placeholder="Tên khách sạn" defaultValue="Hotel Continental" />
            <Input placeholder="Email liên hệ" defaultValue="contact@hotel.com" />
            <Input placeholder="Số điện thoại" defaultValue="0123 456 789" />
          </div>
          <div className="mt-6">
            <Button className="bg-sky-600 text-white hover:bg-sky-500">Lưu thay đổi</Button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thiết lập nhanh</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <SettingRow label="Gửi email xác nhận" value="Bật" />
            <SettingRow label="Thông báo booking mới" value="Bật" />
            <SettingRow label="Kiểm duyệt phòng mới" value="Tắt" />
            <SettingRow label="Tự động đóng booking" value="Bật" />
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800">
      <span>{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
