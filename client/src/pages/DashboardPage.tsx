import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { DashboardDto } from "@/types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HeartPulse, FileText, ArrowUpRight, ArrowDownRight, AlertCircle, Skull, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const OUTCOME_LABELS: Record<string, string> = {
  "Recovered": "Khỏi",
  "Improved": "Đỡ, giảm",
  "NoChange": "Không thay đổi",
  "Worse": "Nặng hơn",
  "Death": "Tử vong"
};

const ADMISSION_LABELS: Record<string, string> = {
  "Emergency": "Cấp cứu",
  "Outpatient": "KKB",
  "Inpatient": "Điều trị"
};

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fromDay, setFromDay] = useState<string>("");
  const [toDay, setToDay] = useState<string>("");
  const [recordType, setRecordType] = useState<string>("all");

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (fromDay) filters.fromDay = fromDay;
      if (toDay) filters.toDay = toDay;
      if (recordType && recordType !== "all") filters.recordType = parseInt(recordType);

      const result = await api.statistics.getDashboard(filters);
      // Map labels for outcome distribution
      if (result.outcomeDistribution) {
        result.outcomeDistribution = result.outcomeDistribution.map((d: any) => ({
          ...d,
          label: OUTCOME_LABELS[d.label] || d.label
        }));
      }
      // Map labels for admission type distribution
      if (result.admissionTypeDistribution) {
        result.admissionTypeDistribution = result.admissionTypeDistribution.map((d: any) => ({
          ...d,
          label: ADMISSION_LABELS[d.label] || d.label
        }));
      }
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Thống kê & Báo cáo</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-96 text-center text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Lỗi tải dữ liệu</h2>
        <p>{error}</p>
      </div>
    );
  }

  const totalDeaths = (data.mortalityStats.before24h || 0) + (data.mortalityStats.after24h || 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Thống kê & Báo cáo</h1>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <Label htmlFor="fromDay" className="text-sm font-medium text-gray-600">Từ ngày</Label>
            <Input 
              id="fromDay"
              type="date" 
              value={fromDay} 
              onChange={(e) => setFromDay(e.target.value)}
              className="w-[140px] h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="toDay" className="text-sm font-medium text-gray-600">Đến ngày</Label>
            <Input 
              id="toDay"
              type="date" 
              value={toDay} 
              onChange={(e) => setToDay(e.target.value)}
              className="w-[140px] h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="recordType" className="text-sm font-medium text-gray-600">Loại hồ sơ</Label>
            <Select value={recordType} onValueChange={setRecordType}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="1">Nội khoa</SelectItem>
                <SelectItem value="2">Ngoại khoa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => fetchDashboard()} className="h-9 bg-vlu-red hover:bg-red-700 text-white">
            <Filter className="w-4 h-4 mr-2" />
            Lọc
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase text-gray-500">Tổng hồ sơ bệnh án</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{data.summary.totalRecords}</div>
            <p className="text-xs text-gray-500 mt-1 italic">Dữ liệu lưu trữ toàn hệ thống</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase text-gray-500">Tỷ lệ cấp cứu</CardTitle>
            <HeartPulse className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{data.summary.emergencyRate}%</div>
            <p className="text-xs text-gray-500 mt-1 italic">Trên tổng số ca nhập viện</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase text-gray-500">Tổng ca tử vong</CardTitle>
            <Skull className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{totalDeaths}</div>
            <p className="text-xs text-gray-500 mt-1 italic">Bao gồm trước và sau 24 giờ</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Trend Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">Biến động số lượng hồ sơ bệnh án (6 tháng gần nhất)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trends.medicalRecords}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="value" name="Số lượng hồ sơ" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distributions and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-md font-semibold text-gray-700">Kết quả điều trị</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.outcomeDistribution.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="label"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.outcomeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-md font-semibold text-gray-700">Loại hình nhập viện</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.admissionTypeDistribution.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="label"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.admissionTypeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-md font-semibold text-gray-700">Chi tiết tử vong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-600 font-medium">Trước 24 giờ</span>
                <span className="font-bold text-lg text-red-600">{data.mortalityStats.before24h} <span className="text-sm font-normal text-gray-400 ml-1">ca</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-600 font-medium">Sau 24 giờ</span>
                <span className="font-bold text-lg text-red-800">{data.mortalityStats.after24h} <span className="text-sm font-normal text-gray-400 ml-1">ca</span></span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium">Tỷ lệ khám nghiệm</span>
                  <span className="text-[10px] text-gray-400">Trên tổng ca tử vong</span>
                </div>
                <span className="font-bold text-xl text-red-600">{data.mortalityStats.autopsyRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Information at the bottom */}
      <div className="pt-10 mt-10 border-t-2 border-dashed border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Thống kê người dùng hệ thống</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-green-50/30 border-green-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase text-green-700">Người dùng mới (Tháng này)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{data.userGrowth.newUsersThisMonth}</div>
              <p className="text-xs mt-2 flex items-center">
                <span className={`px-1.5 py-0.5 rounded-full flex items-center font-bold ${data.userGrowth.isIncrease ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {data.userGrowth.isIncrease ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {data.userGrowth.growthPercentage}%
                </span>
                <span className="text-gray-500 ml-2">so với tháng trước ({data.userGrowth.newUsersLastMonth})</span>
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-gray-500">Biến động người dùng mới (6 tháng)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trends.userOnboarding}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" name="Người dùng mới" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;