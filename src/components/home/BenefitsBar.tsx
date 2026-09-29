import React from 'react';
import { Truck, ShieldCheck, Clock, Headphones } from 'lucide-react';

export const BenefitsBar: React.FC = () => {
  const benefits = [
    { title: 'ارسال سریع به تمام نقاط ایران', icon: Truck },
    { title: 'ضمانت ۱۸ ماهه اصالت کالا', icon: ShieldCheck },
    { title: '۷ روز مهلت تست و مرجوعی', icon: Clock },
    { title: 'پشتیبانی تخصصی تلفنی و آنلاین', icon: Headphones },
  ];

  return (
    <div className="w-full bg-slate-50 border border-slate-200/60 rounded-3xl p-4 sm:p-6 select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {benefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center text-emerald-600 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">{b.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
