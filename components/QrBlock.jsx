// components/QrBlock.jsx
import React, { useState } from "react";

export default function QrBlock({ url = "https://awrabsuiteshotel.com.ng/pool-party" }) {
  const [ok, setOk] = useState(true);
  const online = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(url)}`;

  return (
    <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
      {ok ? (
        <img
          src="/poolparty/qr.png"
          alt="QR to Pool Party"
          className="h-full w-full object-contain p-6"
          onError={() => setOk(false)}
        />
      ) : (
        <img
          src={online}
          alt="QR to Pool Party"
          className="h-full w-full object-contain p-6"
        />
      )}
    </div>
  );
}
