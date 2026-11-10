import React from 'react';
import { Monitor, Wifi, WifiOff, Film, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatsCards({ devices = [], contents = [] }) {
  const totalDevices = devices.length;
  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const offlineCount = devices.filter((d) => d.status === 'offline').length;
  const totalContents = contents.length;

  const stats = [
    {
      title: 'Total Layar Display',
      value: totalDevices,
      subtext: `${totalDevices} terdaftar`,
      badge: 'Aktif',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      icon: Monitor,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Perangkat Online',
      value: onlineCount,
      subtext: 'Terhubung WS',
      badge: totalDevices > 0 ? `${Math.round((onlineCount / totalDevices) * 100)}%` : '0%',
      badgeColor: 'text-teal-700 bg-teal-50 border-teal-100',
      icon: Wifi,
      iconBg: 'bg-teal-50 text-teal-600'
    },
    {
      title: 'Perangkat Offline',
      value: offlineCount,
      subtext: 'Menunggu sinyal',
      badge: offlineCount > 0 ? 'Perlu Cek' : 'Normal',
      badgeColor: offlineCount > 0 ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-slate-600 bg-slate-100 border-slate-200',
      icon: WifiOff,
      iconBg: 'bg-slate-100 text-slate-500'
    },
    {
      title: 'Pustaka Aset Media',
      value: totalContents,
      subtext: 'File siap tayang',
      badge: '+ Baru',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      icon: Film,
      iconBg: 'bg-emerald-50 text-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 select-none">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-2xl ${item.iconBg} transition-transform group-hover:scale-105 duration-200`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                {item.badge}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">
                {item.title}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-black text-slate-800 tracking-tight">
                  {item.value}
                </p>
                <span className="text-[11px] font-medium text-slate-400">
                  {item.subtext}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
