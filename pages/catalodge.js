'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiSearch, FiShoppingCart, FiX, FiArrowLeft } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActivityWave from '@/components/ActivityWave';

// —— Menu (manual for now; later load from backend) ——
const MENU = [
  // Pastries
  { id: 'meat-pie', name: 'Meat Pie', price: 1000, category: 'Pastries' },
  { id: 'doughnut', name: 'Doughnut', price: 500, category: 'Pastries' },
  { id: 'bread', name: 'Bread', price: 500, category: 'Pastries' },
  { id: 'cupcake', name: 'Cupcake', price: 500, category: 'Pastries' },
  { id: 'chin-chin', name: 'Chin Chin', price: 1000, category: 'Pastries' },

  // Rice & Pasta
  { id: 'fried-rice', name: 'Fried Rice', price: 500, unit: 'per spoon', category: 'Rice & Pasta' },
  { id: 'jollof-rice', name: 'Jollof Rice', price: 500, unit: 'per spoon', category: 'Rice & Pasta' },
  { id: 'pasta', name: 'Pasta', price: 500, category: 'Rice & Pasta' },

  // Swallows
  { id: 'fufu', name: 'Fufu', price: 300, category: 'Swallows' },
  { id: 'semo', name: 'Semo', price: 300, category: 'Swallows' },
  { id: 'amala', name: 'Amala', price: 300, category: 'Swallows' },

  // Soups
  { id: 'egusi', name: 'Egusi', price: 500, category: 'Soups' },
  { id: 'vegetable', name: 'Vegetable', price: 500, category: 'Soups' },

  // Proteins
  { id: 'chicken', name: 'Chicken', price: 1500, category: 'Proteins' },
  { id: 'beef', name: 'Beef', price: 1000, category: 'Proteins' },
  { id: 'fish', name: 'Fish', price: 1500, category: 'Proteins' },
  { id: 'turkey', name: 'Turkey', price: 2500, category: 'Proteins' },
  { id: 'small-turkey', name: 'Small Turkey', price: 1500, category: 'Proteins' },
  { id: 'gizzard', name: 'Gizzard', price: 200, category: 'Proteins' },
  { id: 'ponmo', name: 'Ponmo', price: 200, category: 'Proteins' },

  // Sides
  { id: 'salad', name: 'Salad', price: 500, category: 'Sides' },
  { id: 'moi-moi', name: 'Moi Moi', price: 500, category: 'Sides' },
  { id: 'takeaway', name: 'Takeaway (Pack)', price: 500, category: 'Sides' },

  // Drinks
  { id: 'pepsi', name: 'Pepsi', price: 700, category: 'Drinks' },
  { id: 'coke', name: 'Coke', price: 700, category: 'Drinks' },
  { id: 'fanta', name: 'Fanta', price: 700, category: 'Drinks' },
  { id: 'water', name: 'Water', price: 500, category: 'Drinks' },
  { id: 'hollandia', name: 'Hollandia', price: 3500, category: 'Drinks' },
  { id: 'exotic', name: 'Exotic', price: 3000, category: 'Drinks' },
  { id: 'fearless', name: 'Fearless', price: 1000, category: 'Drinks' },
  { id: '5alive', name: '5 Alive', price: 2500, category: 'Drinks' },
  { id: 'predator', name: 'Predator', price: 1000, category: 'Drinks' },
];

// Image map (fallbacks to slider1.jpg)
const IMG_MAP = {
  'fried-rice': '/achopys/fried-rice-turkey.jpg',
  'jollof-rice': '/achopys/slider1.jpg',
  'pasta': '/achopys/slider1.jpg',
  'chicken': '/achopys/slider1.jpg',
  'beef': '/achopys/slider1.jpg',
  'fish': '/achopys/slider1.jpg',
  'turkey': '/achopys/slider1.jpg',
  'small-turkey': '/achopys/slider1.jpg',
  'gizzard': '/achopys/slider1.jpg',
  'ponmo': '/achopys/slider1.jpg',
  'salad': '/achopys/slider1.jpg',
  'moi-moi': '/achopys/slider1.jpg',
  'takeaway': '/achopys/slider1.jpg',
  'red-wine': '/achopys/red-wine.jpg',
};

const CATEGORIES = ['All', ...Array.from(new Set(MENU.map(i => i.category)))];
const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// Emojis per category (for wave words)
const EMOJI = {
  'Pastries': ['🥐','🍩','🥖','🧁'],
  'Rice & Pasta': ['🍛','🍝','🍚'],
  'Swallows': ['🥣','🍲'],
  'Soups': ['🥣','🍲'],
  'Proteins': ['🍗','🥩','🐟','🦃'],
  'Sides': ['🥗','🧆'],
  'Drinks': ['🥤','🍹','🍷','🧃','🍺'],
};

export default function CatalodgePage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState('');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Build words for ActivityWave (food/drink + emoji)
  const FOOD_WORDS = useMemo(() => {
    const base = MENU.map((item, idx) => {
      const choices = EMOJI[item.category] || ['⭐'];
      const emoji = choices[idx % choices.length];
      return `${item.name} ${emoji}`;
    });
    return Array.from(new Set(base)).slice(0, 60);
  }, []);

  // Load/save cart
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('catalodge_cart') || '[]');
      if (Array.isArray(saved)) setCart(saved);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem('catalodge_cart', JSON.stringify(cart));
  }, [cart]);

  const filtered = useMemo(() => {
    let list = MENU;
    if (cat !== 'All') list = list.filter((i) => i.category === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [query, cat]);

  const addToCart = (item) => {
    setCart((prev) => {
      const ix = prev.findIndex((p) => p.id === item.id);
      if (ix >= 0) {
        const copy = [...prev];
        copy[ix] = { ...copy[ix], qty: copy[ix].qty + 1 };
        return copy;
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, unit: item.unit, qty: 1 }];
    });
    toast.success(`${item.name} added`, { autoClose: 1200 });
  };
  const dec = (id) => setCart((p) => p.map(i => i.id===id?{...i, qty:i.qty-1}:i).filter(i=>i.qty>0));
  const inc = (id) => setCart((p) => p.map(i => i.id===id?{...i, qty:i.qty+1}:i));
  const removeItem = (id) => setCart((p) => p.filter(i => i.id !== id));
  const clearCart = () => setCart([]);
  const subtotal = useMemo(() => cart.reduce((s,i)=>s+i.price*i.qty,0), [cart]);

  const openCheckout = () => {
    if (cart.length === 0) return toast.error('Your cart is empty');
    setMobileCartOpen(false);
    setCheckoutOpen(true);
  };

  const submitOrder = (e) => {
    e?.preventDefault?.();
    if (!/^\+?\d[\d\s-]{6,}$/.test(phone.trim())) return toast.error('Enter a valid phone number');
    if (!room.trim()) return toast.error('Enter your room number');

    const payload = {
      phone: phone.trim(),
      room_number: room.trim(),
      items: cart.map(({ id, name, price, qty, unit }) => ({ id, name, price, qty, unit })),
      subtotal,
      placed_at: new Date().toISOString(),
      source: 'catalodge',
    };
    console.log('[Catalodge Order]', payload);
    toast.success('Order placed! Our team will contact your room shortly.', { autoClose: 2500 });
    setCheckoutOpen(false);
    clearCart();
    setPhone('');
    setRoom('');
  };

  // helper: get thumbnail per item (fallbacks to slider1.jpg)
  const imgFor = (item) => IMG_MAP[item.id] || `/achopys/slider1.jpg`;

  return (
    <main
      className="min-h-screen pt-8 pb-24"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <ToastContainer />

      {/* Animated Catalodge header */}
      <ActivityWave
        height={220}
        density={28}
        words={FOOD_WORDS}
        palette={['#22c55e', '#0ea5e9', '#f59e0b', '#a855f7', '#ef4444']}
      />

      {/* Content */}
<div className="mx-auto -mt-10 max-w-7xl px-4 md:px-6 relative z-10">
     
        {/* Back to Home only */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/10"
          >
            <FiArrowLeft /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold">Catalodge</h1>
          <p className="opacity-80 mt-1 text-sm md:text-base">
            For <span className="font-semibold">lodged guests</span> only. Add items to your tray and checkout with your phone & room number.
          </p>
        </div>

        {/* Top controls */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-sm border transition 
                  ${cat === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent border-white/20 hover:border-white/40'}
                `}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu..."
              className="w-full rounded-md border border-white/20 bg-white/5 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Grid + Cart */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Menu grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:bg-white/10"
                  >
                    {/* Row layout: left thumbnail + right info */}
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100/30">
                        <Image src={imgFor(item)} alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-xs opacity-70">
                              {item.category}{item.unit ? ` • ${item.unit}` : ''}
                            </div>
                          </div>
                          <div className="whitespace-nowrap font-bold text-blue-400">{fmt(item.price)}</div>
                        </div>

                        <button
                          onClick={() => addToCart(item)}
                          className="mt-3 w-full rounded-md bg-blue-600 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          Add to Tray
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop cart panel (hidden on mobile) */}
          <div className="hidden lg:block">
            <CartPanel
              cart={cart}
              inc={inc}
              dec={dec}
              removeItem={removeItem}
              clearCart={clearCart}
              subtotal={subtotal}
              openCheckout={openCheckout}
            />
          </div>
        </div>
      </div>

      {/* Floating cart button (mobile only) */}
      <button
        onClick={() => setMobileCartOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white shadow-lg hover:bg-blue-700 lg:hidden"
        aria-label="Open cart"
      >
        <FiShoppingCart />
        <span className="text-sm font-semibold">Tray</span>
        {cart.length > 0 && (
          <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700">
            {cart.length}
          </span>
        )}
      </button>

      {/* Mobile cart drawer */}
      <MobileCartDrawer
        open={mobileCartOpen}
        onClose={() => setMobileCartOpen(false)}
        cart={cart}
        inc={inc}
        dec={dec}
        removeItem={removeItem}
        clearCart={clearCart}
        subtotal={subtotal}
        openCheckout={openCheckout}
      />

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          subtotal={subtotal}
          phone={phone}
          setPhone={setPhone}
          room={room}
          setRoom={setRoom}
          onClose={() => setCheckoutOpen(false)}
          onSubmit={submitOrder}
        />
      )}
    </main>
  );
}

function CartPanel({ cart, inc, dec, removeItem, clearCart, subtotal, openCheckout }) {
  return (
    <div className="h-max rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:sticky lg:top-8">
      <div className="mb-3 flex items-center gap-2">
        <FiShoppingCart />
        <h2 className="font-semibold">Your Tray</h2>
        <span className="ml-auto text-xs opacity-70">
          {cart.length} item{cart.length !== 1 ? 's' : ''}
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="text-sm opacity-70">No items yet. Add from the menu.</div>
      ) : (
        <div className="space-y-3">
          {cart.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
              <div className="min-w-0">
                <div className="truncate font-medium">{i.name}</div>
                <div className="text-xs opacity-70">
                  {i.unit ? `${i.unit} • ` : ''}{fmt(i.price)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => dec(i.id)} className="rounded border border-white/20 px-2 hover:bg-white/10">-</button>
                <div className="w-8 text-center">{i.qty}</div>
                <button onClick={() => inc(i.id)} className="rounded border border-white/20 px-2 hover:bg-white/10">+</button>
                <button
                  onClick={() => removeItem(i.id)}
                  className="rounded border border-white/20 p-1 text-red-400 hover:bg-white/10"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <div className="font-semibold">Subtotal</div>
            <div className="font-bold text-blue-400">{fmt(subtotal)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={openCheckout} className="flex-1 rounded-md bg-green-600 py-2 text-white hover:bg-green-700">
              Checkout
            </button>
            <button onClick={clearCart} className="rounded-md border border-white/20 px-3 py-2 text-sm hover:bg-white/10">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileCartDrawer({ open, onClose, cart, inc, dec, removeItem, clearCart, subtotal, openCheckout }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[95] rounded-t-2xl bg-white text-black shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
          >
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-semibold">Your Tray</div>
              <button onClick={onClose} className="rounded p-1 hover:bg-black/5">
                <FiX />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-auto p-4">
              {cart.length === 0 ? (
                <div className="text-sm text-black/70">No items yet. Add from the menu.</div>
              ) : (
                <div className="space-y-3">
                  {cart.map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-3 border-b border-black/10 pb-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{i.name}</div>
                        <div className="text-xs text-black/60">
                          {i.unit ? `${i.unit} • ` : ''}{fmt(i.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => dec(i.id)} className="rounded border border-black/20 px-2 hover:bg-black/5">-</button>
                        <div className="w-8 text-center">{i.qty}</div>
                        <button onClick={() => inc(i.id)} className="rounded border border-black/20 px-2 hover:bg-black/5">+</button>
                        <button
                          onClick={() => removeItem(i.id)}
                          className="rounded border border-black/20 p-1 text-red-500 hover:bg-black/5"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Subtotal</div>
                <div className="font-bold text-blue-600">{fmt(subtotal)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={openCheckout} className="flex-1 rounded-md bg-green-600 py-2 text-white hover:bg-green-700">
                  Checkout
                </button>
                <button onClick={clearCart} className="rounded-md border border-black/20 px-3 py-2 text-sm hover:bg-black/5">
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CheckoutModal({ cart, subtotal, phone, setPhone, room, setRoom, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white text-black shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Room Delivery Details</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-black/5"><FiX /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 812 345 6789"
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Room Number</label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g., 204"
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="rounded-md bg-black/5 p-3 text-sm">
            <div className="mb-1 font-medium">Order Summary</div>
            <ul className="max-h-40 space-y-1 overflow-auto">
              {cart.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span className="truncate">{i.name} × {i.qty}</span>
                  <span>{fmt(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t pt-2">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold">{fmt(subtotal)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 hover:bg-black/5">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Place Order
            </button>
          </div>
        </form>

        <div className="border-t p-3 text-center text-xs text-black/60">
          Orders are prepared by Achopys Center and delivered to your room.
        </div>
      </div>
    </div>
  );
}
