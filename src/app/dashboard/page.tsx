import { Topnav } from "../_components/topnav";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen justify-center bg-[#1A1A1A]">
      <div className="w-full max-w-screen-2xl">
        <Topnav usedIn="dashboard" />
      </div>
    </div>
  );
}
