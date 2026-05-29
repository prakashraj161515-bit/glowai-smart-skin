"use client";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
  isLiked?: boolean;
}

export default function ProductCard({ name, price, image, isLiked: initialLiked = false }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col gap-3"
    >
      <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden bg-white shadow-sm border border-[rgba(60,30,20,0.08)]">
        <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#F0886A] shadow-sm active:scale-90 transition-transform"
        >
          <Heart size={20} className={isLiked ? "fill-[#F0886A]" : ""} />
        </button>
      </div>
      <div className="px-1">
        <h3 className="text-[14px] font-bold text-[#2C1F1A] line-clamp-1">{name}</h3>
        <p className="text-[14px] font-black text-[#F0886A] mt-0.5">{price}</p>
      </div>
    </motion.div>
  );
}
