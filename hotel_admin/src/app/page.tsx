import { BarChart, BedDouble, CalendarCheck, Users, DollarSign } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
      </div>

       {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1 */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
            <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Tổng Doanh Thu</h3>
                <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$45,231.89</div>
            <p className="text-xs text-green-600 mt-1">+20.1% so với tháng trước</p>
        </div>

         {/* Card 2 */}
         <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
            <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Khách đang ở</h3>
                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">2,350</div>
            <p className="text-xs text-green-600 mt-1">+180.1% so với tháng trước</p>
        </div>

         {/* Card 3 */}
         <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
            <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Phòng trống</h3>
                <BedDouble className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
            <p className="text-xs text-red-500 mt-1">-5% so với hôm qua</p>
        </div>

         {/* Card 4 */}
         <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
            <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Đặt phòng mới</h3>
                <CalendarCheck className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">573</div>
            <p className="text-xs text-green-600 mt-1">+201 kể từ giờ trước</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Main Chart Section */}
        <div className="col-span-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight text-gray-900 dark:text-white">Tổng quan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Biểu đồ doanh thu năm nay.</p>
            </div>
            <div className="p-6 pt-0">
               <div className="h-[300px] flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-md border border-dashed border-gray-300 dark:border-gray-700">
                 <span className="text-sm">Khu vực biểu đồ (Placeholder)</span>
               </div>
            </div>
        </div>

        {/* Recent Sales/Activity Section */}
        <div className="col-span-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
             <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight text-gray-900 dark:text-white">Hoạt động gần đây</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Các hoạt động đặt phòng mới nhất.</p>
            </div>
            <div className="p-6 pt-0">
                <div className="space-y-6">
                     <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">NV</div>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">Nguyen Van A</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Đặt phòng Deluxe (2 đêm)</p>
                        </div>
                        <div className="ml-auto font-medium text-gray-900 dark:text-white">+$200.00</div>
                    </div>
                     <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">TB</div>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">Tran Thi B</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Check-in Suite (3 đêm)</p>
                        </div>
                        <div className="ml-auto font-medium text-gray-900 dark:text-white">+$900.00</div>
                    </div>
                     <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">LC</div>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">Le C</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Đặt dịch vụ Spa</p>
                        </div>
                        <div className="ml-auto font-medium text-gray-900 dark:text-white">+$50.00</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
