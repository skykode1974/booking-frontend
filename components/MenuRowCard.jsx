// components/MenuRowCard.jsx
import React from "react";
import Image from "next/image";

export default function MenuRowCard({
  item,           // { id, name, price(number), img, desc? }
  qty = 0,        // current quantity in tray
  onAdd,          // fn(item)
  onMinus        // fn(item)
}) {
  const priceNGN = new Intl.NumberFormat("en-NG").format(item.price || 0);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
        <Image src={item.img} alt={item.name} fill className="object-cover" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate font-semibold">{item.name}</h3>
          <span className="whitespace-nowrap text-sm font-medium">₦{priceNGN}</span>
        </div>
        {item.desc && <p className="truncate text-xs opacity-70">{item.desc}</p>}

        <div className="mt-2">
          {qty > 0 ? (
            <div className="inline-flex items-center overflow-hidden rounded-xl border border-neutral-300 bg-white text-sm dark:border-neutral-700 dark:bg-neutral-900">
              <button onClick={() => onMinus(item)} className="px-3 py-1.5">−</button>
              <span className="px-3 py-1.5">{qty}</span>
              <button onClick={() => onAdd(item)} className="px-3 py-1.5">+</button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              className="rounded-xl bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Add to tray
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
