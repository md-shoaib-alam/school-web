import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  DollarSign, 
  CreditCard, 
  GraduationCap 
} from "lucide-react";
import { DashboardData } from "./types";

interface DashboardHeroProps {
  loading: boolean;
  data: DashboardData | undefined;
}

export function DashboardHero({ loading, data }: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 p-6 lg:p-8 text-white shadow-lg">
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-700/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-teal-600/10 rounded-full translate-y-1/2 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
            <ShieldCheck className="h-7 w-7 text-teal-200" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Platform Command Center</h2>
            <p className="text-teal-100 text-sm mt-0.5 opacity-90 font-medium">
              Multi-tenant SaaS overview and platform-wide analytics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10">
                <Skeleton className="h-3 w-16 bg-white/10" />
                <Skeleton className="h-8 w-12 bg-white/10 mt-2" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 hover:bg-white/10 transition-colors group">
                <p className="text-teal-200 text-[10px] font-black uppercase tracking-widest mb-1">Schools</p>
                <p className="text-2xl font-black flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-teal-400 group-hover:scale-110 transition-transform" />
                  {data?.tenants.total ?? 0}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 hover:bg-white/10 transition-colors group">
                <p className="text-teal-200 text-[10px] font-black uppercase tracking-widest mb-1">Users</p>
                <p className="text-2xl font-black flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-400 group-hover:scale-110 transition-transform" />
                  {data?.users.total ?? 0}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 hover:bg-white/10 transition-colors group">
                <p className="text-teal-200 text-[10px] font-black uppercase tracking-widest mb-1">Revenue</p>
                <p className="text-2xl font-black flex items-center gap-1">
                  <DollarSign className="h-5 w-5 text-teal-400 group-hover:scale-110 transition-transform" />
                  {(data?.revenue.total ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 hover:bg-white/10 transition-colors group">
                <p className="text-teal-200 text-[10px] font-black uppercase tracking-widest mb-1">Subs</p>
                <p className="text-2xl font-black flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-teal-400 group-hover:scale-110 transition-transform" />
                  {data?.subscriptions.active ?? 0}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 hover:bg-white/10 transition-colors group hidden sm:block">
                <p className="text-teal-200 text-[10px] font-black uppercase tracking-widest mb-1">Classes</p>
                <p className="text-2xl font-black flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-teal-400 group-hover:scale-110 transition-transform" />
                  {data?.classes ?? 0}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
