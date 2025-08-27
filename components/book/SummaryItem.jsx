// /components/book/SummaryItem.jsx
"use client";
export default function SummaryItem({ label, value, strong }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className={`text-lg ${strong ? "font-extrabold text-emerald-400" : "font-semibold"}`}>
        {value}
      </div>
    </div>
  );
}
