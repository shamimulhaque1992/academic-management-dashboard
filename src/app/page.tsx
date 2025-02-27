import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { TopStudents } from "@/components/dashboard/TopStudents";
import { PopularCourses } from "@/components/dashboard/PopularCourses";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      <DashboardStats />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopStudents />
        <PopularCourses />
      </div>
      <EnrollmentChart />
    </div>
  );
}
