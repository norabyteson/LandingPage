export default function DashboardMockup() {
  return (
    <div className="w-full h-full bg-[#0D0D0D] flex overflow-hidden text-slate-100 select-none pointer-events-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-44 flex-shrink-0 bg-[#161616] border-r border-[#262626] flex flex-col justify-between p-3">
        <div className="flex flex-col gap-5">
          <div className="px-1">
            <span style={{ fontFamily: "'Geist', sans-serif", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "-0.025em", color: "#F0F0F0" }}>
              NORA<span style={{ color: "#2563EB" }}>BYTE</span>
            </span>
            <p className="text-slate-500 text-[9px] mt-0.5">Admin Console</p>
          </div>
          <nav className="flex flex-col gap-0.5">
            {[
              { label: "Dashboard", active: true },
              { label: "Analytics" },
              { label: "Orders" },
              { label: "Inventory" },
              { label: "Customers", highlight: true },
              { label: "Settings" },
            ].map(({ label, active, highlight }) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium ${
                  active ? "bg-[#2563EB] text-white" : highlight ? "bg-white/5 text-slate-200" : "text-slate-400"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white" : "bg-slate-600"}`} />
                {label}
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-full bg-[#2563EB] text-white text-[10px] font-bold py-1.5 rounded-lg text-center">
            + New Report
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center text-[8px] font-bold">N</div>
            <div>
              <p className="text-[10px] font-semibold">Nora Byte</p>
              <p className="text-[8px] text-slate-500">System Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0D0D0D]">
        {/* Header */}
        <header className="h-10 border-b border-[#262626] flex items-center justify-between px-5 bg-[#0D0D0D]/80">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold tracking-tight">Dashboard Overview</h2>
            <div className="bg-[#161616] border border-[#262626] rounded-lg px-3 py-1 text-[10px] text-slate-500">
              Search data...
            </div>
          </div>
          <div className="flex items-center gap-2">
            {["🔔", "❓"].map((icon, i) => (
              <div key={i} className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#161616] border border-[#262626] text-[11px]">
                {icon}
              </div>
            ))}
          </div>
        </header>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4 overflow-hidden">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Revenue", value: "$128,430", change: "+12.5% from last month", up: true },
              { label: "Active Orders", value: "42", change: "-2.4% from yesterday", up: false },
              { label: "New Customers", value: "1,204", change: "+18.1% vs avg", up: true },
              { label: "Avg. Order Value", value: "$305.78", change: "+4.2% growth", up: true },
            ].map(({ label, value, change, up }) => (
              <div key={label} className="bg-[#161616] border border-[#262626] p-3 rounded-xl flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[9px] font-medium">{label}</span>
                  <div className="w-4 h-4 rounded bg-[#2563EB]/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  </div>
                </div>
                <span className="text-base font-bold tracking-tight">{value}</span>
                <span className={`text-[8px] font-bold ${up ? "text-emerald-500" : "text-rose-500"}`}>
                  {up ? "↑" : "↓"} {change}
                </span>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-3">
            {/* Line Chart */}
            <div className="col-span-2 bg-[#161616] border border-[#262626] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold">Weekly Sales Growth</h3>
                  <p className="text-slate-500 text-[9px]">Performance tracking across current cycle</p>
                </div>
                <div className="flex bg-[#0D0D0D] rounded-lg p-0.5 border border-[#262626]">
                  <div className="px-2 py-0.5 text-[9px] font-bold rounded bg-[#2563EB] text-white">Week</div>
                  <div className="px-2 py-0.5 text-[9px] font-bold text-slate-500">Month</div>
                </div>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-lg font-bold">$45,200.00</span>
                <span className="text-emerald-500 text-[10px] font-bold mb-0.5">+14.2%</span>
              </div>
              <div className="h-24 w-full">
                <svg viewBox="0 0 1000 200" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cg" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,150 Q100,140 200,80 T400,100 T600,40 T800,90 T1000,20 L1000,200 L0,200 Z" fill="url(#cg)" />
                  <path d="M0,150 Q100,140 200,80 T400,100 T600,40 T800,90 T1000,20" fill="none" stroke="#2563EB" strokeWidth="3" />
                </svg>
                <div className="flex justify-between border-t border-[#262626] pt-1.5">
                  {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d => (
                    <span key={d} className="text-[8px] text-slate-500 font-bold">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-[#161616] border border-[#262626] rounded-xl p-4 flex flex-col gap-4">
              <h3 className="text-xs font-bold">Real-time Insights</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Direct Sales", value: "$24.2k", path: "M0,20 L20,15 L40,25 L60,10 L80,30 L100,15 L120,20 L140,5 L160,25 L180,10 L200,15", color: "#2563EB" },
                  { label: "Marketplace", value: "$18.9k", path: "M0,30 L20,25 L40,35 L60,20 L80,25 L100,30 L120,15 L140,20 L160,10 L180,25 L200,20", color: "#10B981" },
                ].map(({ label, value, path, color }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400">{label}</span>
                      <span className="text-[9px] font-bold">{value}</span>
                    </div>
                    <svg viewBox="0 0 200 40" className="w-full h-7">
                      <path d={path} fill="none" stroke={color} strokeWidth="2" />
                    </svg>
                  </div>
                ))}
                <div className="p-2.5 rounded-lg bg-[#0D0D0D] border border-[#262626] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border-[3px] border-[#2563EB] border-t-transparent flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] font-bold">85%</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold">Goal Reach</p>
                    <p className="text-[8px] text-slate-500">Monthly target almost met</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#161616] border border-[#262626] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#262626] flex items-center justify-between">
              <h3 className="text-xs font-bold">Active Order Tracking</h3>
              <span className="text-[#2563EB] text-[9px] font-bold">View All Orders</span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-white/5 text-slate-400 text-[8px] font-bold uppercase tracking-wider">
                <tr>
                  {["Order ID","Customer","Product","Amount","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {[
                  { id: "#ORD-7721", initials: "JD", color: "bg-[#2563EB]/20 text-[#2563EB]", name: "Jane Doe", product: "Quantum GPU Module", amount: "$2,499.00", status: "Processing", statusColor: "bg-amber-500/10 text-amber-500" },
                  { id: "#ORD-7720", initials: "MS", color: "bg-emerald-500/20 text-emerald-500", name: "Michael Smith", product: "Neural Link Core", amount: "$1,200.00", status: "Shipped", statusColor: "bg-[#2563EB]/10 text-[#2563EB]" },
                  { id: "#ORD-7719", initials: "AK", color: "bg-purple-500/20 text-purple-500", name: "Aria Khan", product: "Server Rack S3", amount: "$8,400.00", status: "Delivered", statusColor: "bg-emerald-500/10 text-emerald-500" },
                ].map(row => (
                  <tr key={row.id} className="hover:bg-white/5">
                    <td className="px-4 py-2 text-[10px] font-medium">{row.id}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full ${row.color} flex items-center justify-center text-[8px] font-bold`}>{row.initials}</div>
                        <span className="text-[10px]">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[10px]">{row.product}</td>
                    <td className="px-4 py-2 text-[10px] font-bold">{row.amount}</td>
                    <td className="px-4 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${row.statusColor}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-500 text-[10px]">···</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
