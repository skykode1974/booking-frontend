'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiTrash2, FiSearch, FiShoppingCart, FiX, FiArrowLeft } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';


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

const CATEGORIES = ['All', ...Array.from(new Set(MENU.map(i => i.category)))];
const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function CatalodgePage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState('');

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

  return (
    <main className="min-h-screen pt-8 pb-16 px-4 md:px-6"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        {/* Back to Home only */}
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
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
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
              className="w-full pl-10 pr-3 py-2 rounded-md border border-white/20 bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Grid + Cart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25 }}
                    className="border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs opacity-70">
                          {item.category}{item.unit ? ` • ${item.unit}` : ''}
                        </div>
                      </div>
                      <div className="text-blue-400 font-bold">
                        {`₦${Number(item.price).toLocaleString('en-NG')}`}
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      className="mt-4 w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm"
                    >
                      Add to Tray
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Cart panel */}
          <div className="lg:sticky lg:top-8 h-max border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <FiShoppingCart />
              <h2 className="font-semibold">Your Tray</h2>
              <span className="ml-auto text-xs opacity-70">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
            </div>

            {cart.length === 0 ? (
              <div className="text-sm opacity-70">No items yet. Add from the menu.</div>
            ) : (
              <div className="space-y-3">
                {cart.map((i) => (
                  <div key={i.id} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{i.name}</div>
                      <div className="text-xs opacity-70">
                        {i.unit ? `${i.unit} • ` : ''}{fmt(i.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => dec(i.id)} className="px-2 rounded border border-white/20 hover:bg-white/10">-</button>
                      <div className="w-8 text-center">{i.qty}</div>
                      <button onClick={() => inc(i.id)} className="px-2 rounded border border-white/20 hover:bg-white/10">+</button>
                      <button onClick={() => removeItem(i.id)} className="p-1 rounded border border-white/20 hover:bg-white/10 text-red-400">
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
                  <button
                    onClick={openCheckout}
                    className="flex-1 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
                  >
                    Checkout
                  </button>
                  <button
                    onClick={clearCart}
                    className="py-2 px-3 rounded-md border border-white/20 hover:bg-white/10 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white text-black shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Room Delivery Details</h3>
              <button onClick={() => setCheckoutOpen(false)} className="p-1 rounded hover:bg-black/5"><FiX /></button>
            </div>

            <form onSubmit={submitOrder} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 812 345 6789"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Room Number</label>
                <input
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g., 204"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-black/5 rounded-md p-3 text-sm">
                <div className="font-medium mb-1">Order Summary</div>
                <ul className="space-y-1 max-h-40 overflow-auto">
                  {cart.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span className="truncate">{i.name} × {i.qty}</span>
                      <span>{fmt(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between mt-2 border-t pt-2">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">{fmt(subtotal)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCheckoutOpen(false)} className="px-4 py-2 rounded-md border hover:bg-black/5">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">
                  Place Order
                </button>
              </div>
            </form>

            <div className="p-3 text-xs text-center text-black/60 border-t">
              Orders are prepared by Achopys Center and delivered to your room.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
