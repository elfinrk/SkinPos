"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Droplets, Trash2 } from "lucide-react";

const tips = [
  {
    title: "Minyak Goreng Bekas",
    desc: "Jangan buang ke wastafel! Minyak bisa membeku dan menyumbat pipa.",
    icon: <Droplets className="text-blue-500" />,
    color: "bg-blue-50"
  },
  {
    title: "Pilah Sampah",
    desc: "Pisahkan sampah organik dan plastik agar mudah didaur ulang.",
    icon: <Trash2 className="text-green-500" />,
    color: "bg-green-50"
  }
];

export default function EducationCard() {
  // Ambil tip secara acak atau berdasarkan minggu ini
  const tip = tips[0]; 

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-[2rem] border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#15803d] p-2 rounded-xl text-white">
          <Sparkles size={18} />
        </div>
        <h3 className="font-bold text-gray-900 tracking-tight">Tips Minggu Ini</h3>
      </div>
      
      <div className={`aspect-video rounded-2xl ${tip.color} flex items-center justify-center mb-4 overflow-hidden relative`}>
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-6xl"
        >
          {tip.icon}
        </motion.div>
        {/* Dekorasi abstrak */}
        <div className="absolute -bottom-2 -right-2 opacity-10 text-gray-900">
           <Sparkles size={80} />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-[#15803d]">{tip.title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {tip.desc}
        </p>
      </div>

      <button className="mt-5 w-full py-3 bg-gray-50 rounded-xl text-gray-700 text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-[#15803d] group-hover:text-white transition-colors">
        Pelajari Selengkapnya <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}