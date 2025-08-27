// /utils/normalize.js
export function normalizeRoom(r) {
  const departure_at_raw =
    r.hms_booking_departure_date_time ??
    r.next_checkout_at ??
    r.check_out ??
    r.departure_datetime ??
    r.occupied_until ??
    r.departure_date_time ??
    r.checkout_at ??
    r.checkout_time ??
    r.checkout_datetime ??
    r.checkout_date_time ??
    null;

  const cleaning_until_raw =
    r.cleaning_until ?? r.clean_until ?? r.cleaning_till ?? r.cleaning_end ?? null;

  return {
    id: String(r.id ?? r.room_id ?? r.ID),
    room_number: r.room_number ?? r.name ?? r.number ?? String(r.id),
    floor: r.floor ?? r.level ?? null,

    // unified keys used across UI
    departure_at_raw,
    cleaning_until_raw,

    // legacy for compatibility
    next_checkout_at: departure_at_raw,
    cleaning_until: cleaning_until_raw,

    is_available: r.is_available ?? undefined,
  };
}
