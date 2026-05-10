"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, ChevronLeft, Star, Plus, Minus, 
  Trash2, Search, Filter, ShoppingCart, ArrowRight,
  ShieldCheck, Truck, RotateCcw
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PRODUCTS = [
  {
    id: "1",
    name: "Vitamin C Glow Serum",
    category: "Serums",
    price: 1299,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
    rating: 4.8,
    reviews: 124,
    description: "Brightens skin tone and reduces dark spots with 10% pure Vitamin C.",
    skinType: ["All", "Dull Skin"]
  },
  {
    id: "2",
    name: "Hyaluronic Acid Hydrator",
    category: "Moisturizers",
    price: 899,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80",
    rating: 4.9,
    reviews: 89,
    description: "Deep hydration for 24 hours with multi-molecular hyaluronic acid.",
    skinType: ["Dry", "Combination"]
  },
  {
    id: "3",
    name: "Salicylic Acid Cleanser",
    category: "Cleansers",
    price: 549,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80",
    rating: 4.7,
    reviews: 215,
    description: "Deep cleans pores and prevents acne breakouts.",
    skinType: ["Oily", "Acne-Prone"]
  },
  {
    id: "4",
    name: "Niacinamide Oil Control",
    category: "Serums",
    price: 749,
    image: "https://images.unsplash.com/photo-1594125356715-c0852e690082?w=500&q=80",
    rating: 4.6,
    reviews: 56,
    description: "Reduces sebum production and minimizes pores.",
    skinType: ["Oily", "Combination"]
  },
  {
    id: "5",
    name: "Barrier Repair Cream",
    category: "Moisturizers",
    price: 999,
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&q=80",
    rating: 4.9,
    reviews: 42,
    description: "Ceramide-rich formula to heal damaged skin barrier.",
    skinType: ["Sensitive", "Dry"]
  },
  {
    id: "6",
    name: "SPF 50+ Invisible Shield",
    category: "Sunscreen",
    price: 699,
    image: "https://images.unsplash.com/photo-1556228578-567ba127e37f?w=500&q=80",
    rating: 4.8,
    reviews: 312,
    description: "Zero white cast, ultra-light protection from UV rays.",
    skinType: ["All"]
  }
];

export default function StorePage() {
  const [cart, setCart] = useState<{product: typeof PRODUCTS[0], quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Serums", "Moisturizers", "Cleansers", "Sunscreen"];

  const addToCart = (product: typeof PRODUCTS[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDF5F2] font-outfit pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-[#FDF5F2]/80 backdrop-blur-md z-50">
        <Link href="/" className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-[#F3EAE8]">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-[18px] font-bold text-slate-800">Skin Store</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#F88E7D] shadow-sm border border-[#F3EAE8] relative"
        >
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F88E7D] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FDF5F2]">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      <div className="px-6">
        {/* Search & Filter */}
        <div className="mb-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Search skin products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-white rounded-3xl pl-14 pr-6 text-[14px] font-medium text-slate-600 border border-[#F3EAE8] focus:outline-none focus:border-[#F88E7D] transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-3 rounded-full text-[12px] font-bold whitespace-nowrap transition-all",
                  activeCategory === cat ? "bg-[#F88E7D] text-white shadow-lg shadow-orange-500/20" : "bg-white text-slate-400 border border-[#F3EAE8]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-3 border border-[#F3EAE8] shadow-sm flex flex-col"
            >
              <div className="aspect-square rounded-[24px] bg-slate-50 overflow-hidden relative mb-3">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <button 
                  onClick={() => addToCart(product)}
                  className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#F88E7D] shadow-xl active:scale-90 transition-transform"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="px-1">
                <div className="flex items-center gap-1 mb-1">
                  <Star size={10} className="text-orange-400 fill-orange-400" />
                  <span className="text-[10px] font-bold text-slate-400">{product.rating}</span>
                </div>
                <h3 className="text-[13px] font-bold text-slate-800 leading-tight mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-[14px] font-black text-[#F88E7D]">₹{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[48px] z-[110] min-h-[60vh] max-h-[90vh] flex flex-col"
            >
              <div className="px-8 pt-10 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFEDE8] rounded-xl flex items-center justify-center text-[#F88E7D]">
                    <ShoppingCart size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Your Cart</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 space-y-4 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <ShoppingBag size={40} />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{item.product.name}</h4>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[14px] font-black text-[#F88E7D]">₹{item.product.price}</p>
                          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                            <button onClick={() => updateQuantity(item.product.id, -1)} className="text-slate-400"><Minus size={14} /></button>
                            <span className="text-[12px] font-bold text-slate-800">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, 1)} className="text-[#F88E7D]"><Plus size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 border-t border-slate-100 space-y-6">
                <div className="space-y-2 px-2">
                  <div className="flex justify-between text-slate-400 text-[13px] font-medium">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[13px] font-medium">
                    <span>Delivery</span>
                    <span className="text-emerald-500 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-800 text-lg font-black pt-2">
                    <span>Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                <button 
                  disabled={cart.length === 0}
                  className="w-full h-16 bg-primary-gradient text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  Checkout Now <ArrowRight size={20} className="inline ml-2" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trust Badges */}
      <div className="px-6 mt-12 grid grid-cols-3 gap-4">
        {[
          { icon: <ShieldCheck size={20} />, label: "100% Genuine" },
          { icon: <Truck size={20} />, label: "Fast Delivery" },
          { icon: <RotateCcw size={20} />, label: "Easy Returns" }
        ].map((badge, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">{badge.icon}</div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{badge.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
