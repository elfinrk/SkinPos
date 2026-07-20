"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Search, UserCheck, CheckCircle2,
  PackagePlus, History, LogOut, Boxes, XCircle,
  Loader2, Plus, Minus, ReceiptText, HelpCircle,
  FileDown, FileSpreadsheet, PanelLeftClose, PanelLeftOpen,
  UsersRound, ShieldAlert, Clock, Info, AlertTriangle, Trash2, Wallet,
  Sparkles, CreditCard, QrCode, Banknote, MoreHorizontal,
  Phone, Calendar, Percent, ChevronRight, Package, Zap,
  TrendingUp, DollarSign, Receipt, User
} from "lucide-react";

import { Plus_Jakarta_Sans } from "next/font/google";
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

/* ───────── DATA ───────── */

const INITIAL_INVENTORY = [
  { id: "P01", name: "Serum Vitamin C", price: 120000, stock: 10, type: "Produk", exp: "15/12/2026" },
  { id: "P02", name: "Sunscreen SPF 50", price: 85000, stock: 15, type: "Produk", exp: "20/05/2026" },
  { id: "P03", name: "Facial Wash Acne", price: 65000, stock: 5, type: "Produk", exp: "25/10/2026" },
  { id: "P04", name: "Skincare Cream Expired", price: 95000, stock: 8, type: "Produk", exp: "10/01/2024" },
  { id: "T01", name: "Treatment Glowing", price: 250000, stock: 999, type: "Layanan", exp: "-" },
  { id: "T02", name: "Acne Peeling", price: 350000, stock: 999, type: "Layanan", exp: "-" },
];

const MEMBER_DB = [
  { phone: "08123456789", name: "Nanda", discount: 0.10, dob: "1998-05-12" },
  { phone: "08987654321", name: "Sarah", discount: 0.15, dob: "2001-11-23" },
];

/* ───────── HELPERS ───────── */

const formatRupiah = (number: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

const formatWaktu = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
};

const formatDOB = (dobStr?: string) => {
  if (!dobStr) return "-";
  const parts = dobStr.split("-");
  if (parts.length !== 3) return dobStr;
  const [year, month, day] = parts;
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const mIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${monthNames[mIndex] || month} ${year}`;
};

const formatInputRibuan = (val: string) => {
  const num = val.replace(/\D/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(num, 10));
};

const parseInputRibuan = (val: string) => {
  return parseFloat(val.replace(/\./g, "")) || 0;
};

const formatDOBInput = (value: string) => {
  const clean = value.replace(/\D/g, "");
  if (clean.length === 0) return "";
  if (clean.length <= 2) return clean;
  if (clean.length <= 4) return `${clean.slice(0, 2)} / ${clean.slice(2)}`;
  return `${clean.slice(0, 2)} / ${clean.slice(2, 4)} / ${clean.slice(4, 8)}`;
};

const isProductExpired = (expDateStr: string) => {
  if (!expDateStr || expDateStr === "-" || expDateStr === "∞") return false;
  const parts = expDateStr.split("/");
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const expDate = new Date(year, month, day);
  const today = new Date();
  expDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  return today > expDate;
};

const playSound = (type: "success" | "alert" | "click" | "cengkring") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (type === "success") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "cengkring") {
      const freqs = [850, 1075, 2200];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0.0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55 + idx * 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.7);
      });
    } else if (type === "alert") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    console.error("Audio failed", e);
  }
};

const isService = (item: any) => item.type === "Layanan" || item.type === "Service";

/* ───────── CUSTOM HOOK: Debounce ───────── */

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

/* ───────── PDF GENERATOR ───────── */

function generatePDF(orders: any[]) {
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const totalTransaksi = orders.length;

  let content = `
LAPORAN PENJUALAN - SKINPOS
Esthetic Rosereve Japan
Tanggal: ${today}
${"=".repeat(60)}

RINGKASAN:
  Total Transaksi  : ${totalTransaksi}
  Status Selesai   : ${orders.filter(o => o.status === "completed").length}
  Status Pending   : ${orders.filter(o => o.status === "pending").length}
  Status Batal     : ${orders.filter(o => o.status === "voided").length}

${"=".repeat(60)}
DETAIL TRANSAKSI:
${"=".repeat(60)}
`;

  orders.forEach((order, idx) => {
    content += `
${idx + 1}. ${order.id} | ${order.time || "-"} | ${order.paymentMethod || "-"}
   Status    : ${order.status === "completed" ? "Selesai" : order.status === "pending" ? "Pending" : order.status === "pending_void" ? "Menunggu Batal" : "Dibatalkan"}
   Member    : ${order.member ? order.member.name : "Umum"}
   Items     :`;
    order.items.forEach((it: any) => {
      content += `\n     - ${it.qty}x ${it.name} (${it.variant}) = ${formatRupiah(it.price * it.qty)}`;
      if (it.note) {
        content += ` [Note: ${it.note}]`;
      }
    });
    content += `
   Subtotal  : ${formatRupiah(order.subtotal)}`;
    if (order.discountAmount > 0) {
      content += `\n   Diskon    : -${formatRupiah(order.discountAmount)}`;
    }
    content += `
   TOTAL     : ${formatRupiah(order.grandTotal)}`;
    if (order.paymentMethod === "Cash" && order.amountPaid !== undefined) {
      content += `\n   Bayar     : ${formatRupiah(order.amountPaid)}\n   Kembali   : ${formatRupiah(order.changeDue)}`;
    }
    content += `
${"─".repeat(60)}`;
  });

  content += `\n\nDicetak oleh SkinPOS System pada ${new Date().toLocaleString("id-ID")}`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_SkinPOS_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ───────── EXCEL/CSV GENERATOR ───────── */

function generateExcel(orders: any[]) {
  const BOM = "\uFEFF";
  let csv = BOM;
  csv += "No,Order ID,Waktu,Status,Member,Metode Bayar,Item,Qty,Harga Satuan,Subtotal Item,Diskon,Grand Total\n";

  let rowNum = 1;
  orders.forEach((order) => {
    order.items.forEach((it: any, idx: number) => {
      csv += [
        rowNum,
        order.id,
        order.time || "-",
        order.status === "completed" ? "Selesai" : order.status === "pending" ? "Pending" : order.status === "pending_void" ? "Menunggu Batal" : "Dibatalkan",
        order.member ? order.member.name : "Umum",
        order.paymentMethod || "-",
        `"${it.name} (${it.variant})"`,
        it.qty,
        it.price,
        it.price * it.qty,
        idx === 0 ? order.discountAmount : 0,
        idx === 0 ? order.grandTotal : 0,
      ].join(",") + "\n";
      rowNum++;
    });
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Rekap_SkinPOS_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ───────── PAYMENT METHOD CONFIG ───────── */

const PAYMENT_METHODS = [
  { key: "Cash", label: "Cash", icon: Banknote },
  { key: "QRIS", label: "QRIS", icon: QrCode },
  { key: "Debit", label: "Debit", icon: CreditCard },
  { key: "Lainnya", label: "Lainnya", icon: MoreHorizontal },
] as const;

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function CashierDashboard() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Auth ── */
  const [isAuthorized, setIsAuthorized] = useState(false);

  /* ── Tabs ── */
  const [activeTab, setActiveTab] = useState<"kasir" | "stok" | "void" | "members">("kasir");

  /* ── Core Data ── */
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  /* ── Search ── */
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 200);
  const [selectedCategory, setSelectedCategory] = useState<"Semua" | "Produk" | "Layanan">("Semua");

  /* ── Member ── */
  const [memberPhone, setMemberPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isCheckingMember, setIsCheckingMember] = useState(false);
  const [activeMember, setActiveMember] = useState<{ name: string; discount: number; dob?: string } | null>(null);

  /* ── Payment ── */
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "QRIS" | "Debit" | "Lainnya">("Cash");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [amountPaid, setAmountPaid] = useState<string>("");

  /* ── Modals ── */
  const [showReceipt, setShowReceipt] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("Normal");

  /* ── Void ── */
  const [voidTarget, setVoidTarget] = useState<any>(null);
  const [voidReason, setVoidReason] = useState("");

  /* ── Voucher Promosi ── */
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [highValueDeleteTarget, setHighValueDeleteTarget] = useState<string | null>(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  /* ── Shift Kasir ── */
  const [isShiftOpen, setIsShiftOpen] = useState<boolean>(false);
  const [initialFloat, setInitialFloat] = useState<number>(0);
  const [cashierName, setCashierName] = useState<string>("");
  const [shiftStartTime, setShiftStartTime] = useState<string>("");
  const [showCloseShiftModal, setShowCloseShiftModal] = useState<boolean>(false);
  const [closeShiftInput, setCloseShiftInput] = useState({ actualCash: "", note: "" });
  const [openShiftInput, setOpenShiftInput] = useState({ cashierName: "", initialFloat: "" });

  /* ── Toast ── */
  const [toast, setToast] = useState<{ type: "success" | "error" | "info" | "warning"; title: string; subtitle: string } | null>(null);

  /* ── Stock Mutation ── */
  const [stockType, setStockType] = useState<"masuk" | "keluar">("masuk");
  const [stockInput, setStockInput] = useState<{ id: string; qty: number; reason: string; expDate: string }>({ id: "", qty: 0, reason: "rusak", expDate: "" });

  /* ── Sidebar ── */
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /* ── Members Form ── */
  const [newMember, setNewMember] = useState({ name: "", phone: "", dob: "", discount: 10 });
  const [dobInput, setDobInput] = useState("");
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [dobPickerDay, setDobPickerDay] = useState("");
  const [dobPickerMonth, setDobPickerMonth] = useState("");
  const [dobPickerYear, setDobPickerYear] = useState("");

  /* ── Stock Expiry Picker ── */
  const [showStockExpPicker, setShowStockExpPicker] = useState(false);
  const [stockExpDay, setStockExpDay] = useState("");
  const [stockExpMonth, setStockExpMonth] = useState("");
  const [stockExpYear, setStockExpYear] = useState("");

  // Sync dobInput selections to dobInput text
  useEffect(() => {
    if (dobPickerDay && dobPickerMonth && dobPickerYear) {
      setDobInput(`${dobPickerDay} / ${dobPickerMonth} / ${dobPickerYear}`);
    }
  }, [dobPickerDay, dobPickerMonth, dobPickerYear]);

  // Sync dobInput text to newMember.dob
  useEffect(() => {
    const parts = dobInput.split(" / ");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      if (d.length === 2 && m.length === 2 && y.length === 4) {
        setNewMember(prev => ({ ...prev, dob: `${y}-${m}-${d}` }));
        return;
      }
    }
    setNewMember(prev => ({ ...prev, dob: "" }));
  }, [dobInput]);

  // Sync stock exp picker selections to stockInput
  useEffect(() => {
    if (stockExpDay && stockExpMonth && stockExpYear) {
      setStockInput(prev => ({ ...prev, expDate: `${stockExpDay}/${stockExpMonth}/${stockExpYear}` }));
    } else {
      setStockInput(prev => ({ ...prev, expDate: "" }));
    }
  }, [stockExpDay, stockExpMonth, stockExpYear]);

  /* ── Live Clock ── */
  const [currentTime, setCurrentTime] = useState("");

  /* ───────── AUTH CHECK ───────── */
  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const role = sessionStorage.getItem("userRole");
    if (isAuth !== "true" || role !== "kasir") {
      router.replace("/");
    } else {
      setIsAuthorized(true);
      if (!localStorage.getItem("skinpos_inventory")) {
        localStorage.setItem("skinpos_inventory", JSON.stringify(INITIAL_INVENTORY));
      }
    }
  }, [router]);

  /* ───────── SYNC DATA ───────── */
  useEffect(() => {
    if (!isAuthorized) return;
    const syncData = () => {
      const sOrders = localStorage.getItem("skinpos_orders");
      const sInv = localStorage.getItem("skinpos_inventory");
      const sMembers = localStorage.getItem("skinpos_members");

      if (sOrders) setOrders(JSON.parse(sOrders));
      if (sInv) setInventory(JSON.parse(sInv));

      if (sMembers) {
        setMembers(JSON.parse(sMembers));
      } else {
        setMembers(MEMBER_DB);
        localStorage.setItem("skinpos_members", JSON.stringify(MEMBER_DB));
      }
    };
    syncData();
    const interval = setInterval(syncData, 2000);
    window.addEventListener("storage", syncData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncData);
    };
  }, [isAuthorized]);

  /* ───────── LOAD ACTIVE SHIFT ───────── */
  useEffect(() => {
    if (!isAuthorized) return;
    const activeShiftRaw = localStorage.getItem("skinpos_active_shift");
    if (activeShiftRaw) {
      const activeShift = JSON.parse(activeShiftRaw);
      setIsShiftOpen(true);
      setInitialFloat(activeShift.initialFloat);
      setCashierName(activeShift.cashierName);
      setShiftStartTime(activeShift.startTime);
    } else {
      setIsShiftOpen(false);
    }
  }, [isAuthorized]);

  /* ───────── LIVE CLOCK ───────── */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Pintasan Keyboard Dihapus */

  /* ───────── SHARED UPDATERS ───────── */
  const updateSharedOrders = useCallback((newOrders: any[]) => {
    setOrders(newOrders);
    localStorage.setItem("skinpos_orders", JSON.stringify(newOrders));
  }, []);

  const updateSharedInventory = useCallback((newInv: any[]) => {
    setInventory(newInv);
    localStorage.setItem("skinpos_inventory", JSON.stringify(newInv));
  }, []);

  /* ───────── TOAST ───────── */
  const showToast = useCallback((type: "success" | "error" | "info" | "warning", title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ───────── FILTERED INVENTORY (memoized) ───────── */
  const filteredInventory = useMemo(() => {
    return inventory.filter((i) => {
      const matchesSearch = i.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || i.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, debouncedSearch, selectedCategory]);

  const filteredMembers = useMemo(() => {
    if (!memberPhone) return [];
    const query = memberPhone.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.phone.includes(query)
    );
  }, [members, memberPhone]);

  const updateCartItemNote = useCallback((cartId: string, note: string) => {
    setCart((prev) => prev.map((c) => (c.cartId === cartId ? { ...c, note } : c)));
  }, []);

  /* ───────── CART SUBTOTALS (memoized) ───────── */
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const voucherDiscountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    const valStr = String(appliedVoucher.value);
    if (valStr.endsWith("%")) {
      const pct = parseFloat(valStr.replace("%", "")) / 100;
      return subtotal * pct;
    } else {
      const cleanNum = parseFloat(valStr.replace(/\D/g, "")) || 0;
      return cleanNum;
    }
  }, [subtotal, appliedVoucher]);

  const discountAmount = useMemo(() => {
    const memberDiscount = activeMember ? subtotal * activeMember.discount : 0;
    return memberDiscount + voucherDiscountAmount;
  }, [subtotal, activeMember, voucherDiscountAmount]);

  const grandTotal = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

  /* ───────── EXPECTED CASH CALCULATION ───────── */
  const calculateExpectedCash = useCallback(() => {
    const activeDate = new Date().toLocaleDateString("id-ID");
    const cashSales = orders
      .filter((o) => o.status === "completed" && o.paymentMethod === "Cash" && o.date === activeDate)
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    return initialFloat + cashSales;
  }, [orders, initialFloat]);

  /* ───────── DAILY STATS (memoized) ───────── */
  const todayStats = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === "completed");
    return {
      totalTransaksi: orders.length,
      totalPendapatan: completedOrders.reduce((s, o) => s + (o.grandTotal || 0), 0),
      completedCount: completedOrders.length,
    };
  }, [orders]);

  /* ───────── PRODUCT CLICK ───────── */
  const handleProductClick = useCallback((item: any) => {
    if (!isService(item) && isProductExpired(item.exp)) {
      showToast("error", "Produk Kadaluwarsa!", `${item.name} sudah kadaluwarsa dan tidak boleh ditransaksikan.`);
      playSound("alert");
      return;
    }
    if (!isService(item) && item.stock <= 0) {
      showToast("error", "Stok Habis!", `${item.name} tidak tersedia.`);
      playSound("alert");
      return;
    }
    if (isService(item)) {
      processAddToCart(item, "Normal");
    } else {
      setSelectedProduct(item);
      setSelectedVariant("Normal");
    }
  }, [showToast]);

  /* ───────── ADD TO CART ───────── */
  const processAddToCart = useCallback((item: any, variant: string) => {
    const cartItemId = `${item.id}-${variant}`;

    setCart((prev) => {
      const existing = prev.find((c) => c.cartId === cartItemId);
      if (existing) {
        if (!isService(item) && existing.qty >= item.stock) {
          showToast("error", "Batas Stok", "Stok fisik tidak mencukupi.");
          playSound("alert");
          return prev;
        }
        return prev.map((c) => (c.cartId === cartItemId ? { ...c, qty: c.qty + 1 } : c));
      }
      return [{ ...item, cartId: cartItemId, variant, qty: 1 }, ...prev];
    });
    setSelectedProduct(null);
  }, [showToast]);

  /* ───────── UPDATE CART QTY ───────── */
  const updateCartItemQty = useCallback((cartId: string, newQty: number, originalId: string) => {
    if (newQty <= 0) return handleRemoveFromCart(cartId);

    const itemInInv = inventory.find((i) => i.id === originalId);
    if (!itemInInv) {
      showToast("error", "Error", "Item tidak ditemukan di inventaris.");
      return;
    }
    if (!isService(itemInInv) && newQty > itemInInv.stock) {
      showToast("error", "Batas Stok", "Stok tidak mencukupi.");
      return;
    }
    setCart((prev) => prev.map((c) => (c.cartId === cartId ? { ...c, qty: newQty } : c)));
  }, [inventory, showToast]);

  /* ───────── REMOVE FROM CART ───────── */
  const handleRemoveFromCart = useCallback((cartId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.cartId === cartId);
      if (item && item.price * item.qty >= 300000) {
        setHighValueDeleteTarget(cartId);
        return prev;
      }
      return prev.filter((c) => c.cartId !== cartId);
    });
  }, []);

  const confirmRemoveHighValueItem = useCallback(() => {
    if (highValueDeleteTarget) {
      setCart((prev) => prev.filter((c) => c.cartId !== highValueDeleteTarget));
      setHighValueDeleteTarget(null);
      showToast("info", "Terhapus", "Item bernilai tinggi telah dihapus.");
    }
  }, [highValueDeleteTarget, showToast]);

  /* ───────── PRINT RECEIPT ───────── */
  const handlePrintReceipt = useCallback((order: any) => {
    const printWindow = window.open("", "_blank", "width=300,height=600");
    if (!printWindow) return;
    
    const itemsHtml = order.items.map((c: any) => `
      <div style="border-bottom: 1px dashed #eee; padding-bottom: 4px; margin-bottom: 4px;">
        <div style="display:flex; justify-content:space-between; font-weight:bold;">
          <span>${c.qty}x ${c.name} (${c.variant})</span>
          <span>${formatRupiah(c.price * c.qty)}</span>
        </div>
        ${c.note ? `<div style="font-size:9px; color:#555; font-style:italic;">* Catatan: ${c.note}</div>` : ""}
      </div>
    `).join("");

    const discountHtml = order.discountAmount > 0 ? `
      <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top:8px; border-top:1px dashed #ccc; padding-top:4px; color:#10b981;">
         <span>Diskon</span>
         <span>-${formatRupiah(order.discountAmount)}</span>
      </div>
    ` : "";

    const cashDetailsHtml = order.paymentMethod === "Cash" && order.amountPaid !== undefined ? `
      <div style="margin-top:8px; border-top:1px dashed #000; padding-top:4px; font-size:10px; color:#555;">
         <div style="display:flex; justify-content:space-between;">
           <span>Tunai Diterima</span>
           <span>${formatRupiah(order.amountPaid)}</span>
         </div>
         <div style="display:flex; justify-content:space-between; font-weight:bold; color:#000;">
           <span>Kembalian</span>
           <span>${formatRupiah(order.changeDue || 0)}</span>
         </div>
      </div>
    ` : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pembayaran - ${order.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; width: 280px; font-size: 11px; line-height: 1.4; color: #000; }
            .header { text-align: center; font-weight: bold; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .footer { text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            ESTHETIC ROSEREVE JAPAN<br>
            No. Struk: ${order.id}<br>
            Waktu: ${order.time}<br>
            Metode: ${order.paymentMethod}
          </div>
          <div>
            ${itemsHtml}
          </div>
          ${discountHtml}
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:12px; border-top:1px dashed #000; margin-top:8px; padding-top:8px;">
            <span>TOTAL</span>
            <span>${formatRupiah(order.grandTotal)}</span>
          </div>
          ${cashDetailsHtml}
          <div class="footer">
            Terima kasih atas kunjungan Anda!<br>
            SkinPOS System
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  /* ───────── MEMBER CHECK ───────── */
  const handlePhoneChange = useCallback((val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    setMemberPhone(cleanVal);
    if (cleanVal && cleanVal.length < 10) setPhoneError("Min. 10 digit");
    else setPhoneError("");
  }, []);

  const handleCheckMember = useCallback(() => {
    if (!memberPhone || phoneError) return;
    setIsCheckingMember(true);
    setTimeout(() => {
      const member = members.find((m) => m.phone === memberPhone);
      if (member) {
        setActiveMember(member);
        showToast("success", "Anggota Ditemukan", member.name);
      } else {
        setActiveMember(null);
        showToast("info", "Pelanggan Umum", "Tidak ada diskon.");
      }
      setIsCheckingMember(false);
    }, 600);
  }, [memberPhone, phoneError, members, showToast]);

  /* ───────── CHECKOUT ───────── */
  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    setShowPaymentModal(false);
    setIsProcessingOrder(true);
    setTimeout(() => {
      const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
      const parsedAmount = parseInputRibuan(amountPaid);

      const newOrder = {
        id: orderId,
        items: [...cart],
        member: activeMember,
        subtotal,
        discountAmount,
        grandTotal,
        time: formatWaktu(),
        date: new Date().toLocaleDateString("id-ID"),
        status: "completed",
        paymentMethod,
        amountPaid: paymentMethod === "Cash" ? (parsedAmount || grandTotal) : grandTotal,
        changeDue: paymentMethod === "Cash" ? Math.max(0, (parsedAmount || grandTotal) - grandTotal) : 0,
        voucher: appliedVoucher ? { id: appliedVoucher.id, name: appliedVoucher.name, value: appliedVoucher.value } : null
      };

      updateSharedOrders([newOrder, ...orders]);

      // Increment promo usage in localStorage
      if (appliedVoucher) {
        const savedPromosRaw = localStorage.getItem("skinpos_promos");
        if (savedPromosRaw) {
          const promosList = JSON.parse(savedPromosRaw);
          const updatedPromos = promosList.map((p: any) =>
            p.id === appliedVoucher.id ? { ...p, usage: (p.usage || 0) + 1 } : p
          );
          localStorage.setItem("skinpos_promos", JSON.stringify(updatedPromos));
        }
      }

      const newInv = inventory.map((item) => {
        const totalQtyInCart = cart.filter((c) => c.id === item.id).reduce((sum, current) => sum + current.qty, 0);
        if (totalQtyInCart > 0 && !isService(item)) {
          return { ...item, stock: item.stock - totalQtyInCart };
        }
        return item;
      });
      updateSharedInventory(newInv);

      setCart([]);
      setActiveMember(null);
      setAppliedVoucher(null);
      setVoucherCodeInput("");
      setMemberPhone("");
      setAmountPaid("");
      showToast("success", "Pembayaran Sukses", `Transaksi ${orderId} menggunakan ${paymentMethod} berhasil.`);
      playSound("cengkring");
      setIsProcessingOrder(false);
      setShowReceipt(newOrder);
    }, 800);
  }, [cart, activeMember, subtotal, discountAmount, grandTotal, paymentMethod, amountPaid, orders, inventory, updateSharedOrders, updateSharedInventory, showToast, appliedVoucher]);

  /* ───────── STOCK MUTATION ───────── */
  const handleStockMutation = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInput.id || stockInput.qty <= 0) return showToast("error", "Error", "Input tidak valid.");
    const targetItem = inventory.find((i) => i.id === stockInput.id);
    if (!targetItem) return showToast("error", "Error", "Item tidak ditemukan.");
    if (stockType === "keluar" && targetItem.stock < stockInput.qty)
      return showToast("error", "Stok Kurang", "Melebihi fisik.");

    const updatedInv = inventory.map((item) =>
      item.id === stockInput.id
        ? {
            ...item,
            stock: stockType === "masuk" ? item.stock + Number(stockInput.qty) : item.stock - Number(stockInput.qty),
            exp: stockType === "masuk" && stockInput.expDate ? stockInput.expDate : item.exp,
          }
        : item
    );
    updateSharedInventory(updatedInv);

    const logs = JSON.parse(localStorage.getItem("skinpos_stock_logs") || "[]");
    logs.unshift({
      itemId: stockInput.id,
      itemName: targetItem.name,
      type: stockType,
      qty: stockInput.qty,
      reason: stockType === "keluar" ? stockInput.reason : "restock",
      time: formatWaktu(),
      date: new Date().toLocaleDateString("id-ID"),
    });
    localStorage.setItem("skinpos_stock_logs", JSON.stringify(logs));

    setStockInput({ id: "", qty: 0, reason: "rusak", expDate: "" });
    setStockExpDay("");
    setStockExpMonth("");
    setStockExpYear("");
    showToast("success", "Tersimpan", "Mutasi stok berhasil diupdate.");
  }, [inventory, stockInput, stockType, updateSharedInventory, showToast]);

  /* ───────── VOID REQUEST ───────── */
  const handleVoidRequest = useCallback((order: any) => {
    setVoidTarget(order);
    setVoidReason("");
  }, []);

  const submitVoidRequest = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!voidReason) return showToast("error", "Data Diperlukan", "Alasan pembatalan harus diisi.");

    const updatedOrders = orders.map((o) =>
      o.id === voidTarget.id ? { ...o, status: "pending_void", voidReason } : o
    );
    updateSharedOrders(updatedOrders);

    showToast("success", "Request Terkirim", "Permintaan void telah dikirim, menunggu ACC Manager.");
    setVoidTarget(null);
  }, [voidReason, voidTarget, orders, updateSharedOrders, showToast]);

  /* ───────── COMPLETE ORDER ───────── */
  const handleSelesaikanTransaksi = useCallback((order: any) => {
    setShowReceipt(order);
    const updated = orders.map((o) => (o.id === order.id ? { ...o, status: "completed" } : o));
    updateSharedOrders(updated);
  }, [orders, updateSharedOrders]);

  /* ───────── PDF / EXCEL DOWNLOAD ───────── */
  const handleDownloadPDF = useCallback(() => {
    if (orders.length === 0) return showToast("error", "Kosong", "Belum ada data transaksi untuk diunduh.");
    generatePDF(orders);
    showToast("success", "Unduh PDF", "Laporan PDF berhasil diunduh.");
  }, [orders, showToast]);

  const handleDownloadExcel = useCallback(() => {
    if (orders.length === 0) return showToast("error", "Kosong", "Belum ada data transaksi untuk diunduh.");
    generateExcel(orders);
    showToast("success", "Unduh Excel", "Rekapitulasi Excel berhasil diunduh.");
  }, [orders, showToast]);

  /* ───────── ADD MEMBER ───────── */
  const handleAddMember = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone || !newMember.dob) {
      return showToast("error", "Data Tidak Lengkap", "Nama, No. HP, dan Tanggal Lahir wajib diisi.");
    }
    const updatedMembers = [
      { phone: newMember.phone, name: newMember.name, dob: newMember.dob, discount: newMember.discount / 100 },
      ...members,
    ];
    setMembers(updatedMembers);
    localStorage.setItem("skinpos_members", JSON.stringify(updatedMembers));
    setNewMember({ name: "", phone: "", dob: "", discount: 10 });
    setDobInput("");
    setDobPickerDay("");
    setDobPickerMonth("");
    setDobPickerYear("");
    showToast("success", "Berhasil", "Data Anggota VIP berhasil ditambahkan.");
  }, [newMember, members, showToast]);

  /* ───────── PENDING ORDERS COUNT ───────── */
  const pendingCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders]);

  /* ───────── GUARD ───────── */
  if (!isAuthorized) return null;

  if (!isShiftOpen) {
    return (
      <div className={`min-h-screen bg-gradient-to-tr from-[#FFF5F7] via-[#FFF9FA] to-[#FFF0F2] flex items-center justify-center p-6 ${jakarta.className}`}>
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 lg:p-10 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-[#FF0055] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/25">
            <Clock size={32} />
          </div>
          <h2 className="text-2xl font-[900] text-slate-800 tracking-tight mb-2">BUKA SHIFT KASIR</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Masukkan modal kas awal untuk memulai transaksi</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!openShiftInput.cashierName || !openShiftInput.initialFloat) {
              showToast("error", "Error", "Silakan isi semua kolom.");
              return;
            }
            const floatVal = parseInputRibuan(openShiftInput.initialFloat);
            const timeNow = new Date().toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" });
            const newShift = {
              cashierName: openShiftInput.cashierName,
              initialFloat: floatVal,
              startTime: timeNow,
              date: new Date().toLocaleDateString("id-ID")
            };
            localStorage.setItem("skinpos_active_shift", JSON.stringify(newShift));
            setIsShiftOpen(true);
            setInitialFloat(floatVal);
            setCashierName(openShiftInput.cashierName);
            setShiftStartTime(timeNow);
            showToast("success", "Shift Dibuka", `Selamat bertugas, ${openShiftInput.cashierName}!`);
          }} className="space-y-5 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#FF0055] uppercase tracking-widest ml-1">Nama Kasir</label>
              <input 
                type="text" 
                value={openShiftInput.cashierName} 
                onChange={(e) => setOpenShiftInput({ ...openShiftInput, cashierName: e.target.value })}
                placeholder="Contoh: Sarah Amelia"
                className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 px-4 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-rose-50 focus:border-[#FF0055] transition-all font-bold text-xs"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#FF0055] uppercase tracking-widest ml-1">Uang Kas Awal (Float Modal - Rp)</label>
              <input 
                type="text" 
                value={openShiftInput.initialFloat} 
                onChange={(e) => setOpenShiftInput({ ...openShiftInput, initialFloat: formatInputRibuan(e.target.value) })}
                placeholder="Contoh: 500.000"
                className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 px-4 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-rose-50 focus:border-[#FF0055] transition-all font-bold text-xs"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-4 rounded-2xl bg-[#FF0055] hover:bg-[#D40048] text-white font-black text-xs tracking-[0.2em] uppercase shadow-lg shadow-rose-500/25 transition-all mt-6"
            >
              Mulai Tugas (Buka Shift)
            </button>
          </form>
        </div>
        {/* TOAST SYSTEM */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-[1000] animate-in slide-in-from-bottom-5">
            <div className="px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center gap-4 min-w-[320px]">
              <CheckCircle2 className="text-emerald-400" size={24} />
              <div>
                <h4 className="font-bold text-[13px] text-white tracking-wide mb-0.5">{toast.title}</h4>
                <p className="text-[11px] text-slate-400 font-medium">{toast.subtitle}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <div className={`flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden ${jakarta.className}`}>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className={`bg-white flex flex-col h-full shrink-0 border-r border-slate-200 z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[260px]" : "w-0 opacity-0 overflow-hidden border-none"}`}>
        {/* Logo */}
        <div className="h-24 flex items-center px-8 border-b border-slate-100 shrink-0 w-[260px]">
          <div className="w-10 h-10 rounded-2xl bg-[#FF0055] flex items-center justify-center shadow-lg shadow-rose-500/20 mr-3">
            <ReceiptText size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-xl tracking-tight block leading-none">
              Kasir<span className="text-[#FF0055]">.</span>
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">SkinPOS Terminal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-5 space-y-2 mt-8 overflow-y-auto w-[260px]">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menu Utama</p>
          {[
            { id: "kasir", icon: ShoppingCart, label: "Terminal Kasir" },
            { id: "stok", icon: Boxes, label: "Manajemen Stok" },
            { id: "void", icon: History, label: "Riwayat & Laporan", count: pendingCount },
            { id: "members", icon: UsersRound, label: "Data Anggota" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-[1.25rem] transition-all font-bold text-sm ${
                activeTab === item.id
                  ? "bg-[#FF0055] text-white shadow-lg shadow-rose-500/25"
                  : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} className={activeTab === item.id ? "text-white" : "text-slate-400"} />
              <span className="whitespace-nowrap">{item.label}</span>
              {item.count ? <span className={`ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-black ${activeTab === item.id ? "bg-white/30 text-white" : "bg-slate-200 text-slate-500"}`}>{item.count}</span> : null}
            </button>
          ))}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lainnya</p>
            <button onClick={() => setShowHelpCenter(true)} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all font-bold text-sm bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50">
              <HelpCircle size={20} strokeWidth={2} className="text-slate-400" />
              <span className="whitespace-nowrap">Pusat Bantuan</span>
            </button>

          </div>
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-slate-100 shrink-0 w-[260px]">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all text-sm font-bold">
            <LogOut size={20} />
            <span className="whitespace-nowrap">Keluar</span>
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7FA] transition-all duration-300">

        {/* ── Header ── */}
        <header className="h-24 bg-white border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
              title={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose size={22} strokeWidth={2} /> : <PanelLeftOpen size={22} strokeWidth={2} />}
            </button>
            <div>
              <h1 className="text-[18px] lg:text-[22px] font-extrabold text-slate-800 tracking-tight">SkinPOS Terminal</h1>
              <p className="text-[10px] lg:text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Daily Stats */}
            <div className="hidden xl:flex items-center gap-6 mr-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <TrendingUp size={14} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transaksi</p>
                  <p className="text-[13px] font-black text-slate-800">{todayStats.totalTransaksi}</p>
                </div>
              </div>
            </div>
            {/* Clock */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
              <Clock size={14} className="text-slate-400" />
              <span className="text-[12px] font-bold text-slate-600 tabular-nums">{currentTime}</span>
            </div>
            {/* Tutup Shift */}
            <button
              onClick={() => {
                setCloseShiftInput({ actualCash: "", note: "" });
                setShowCloseShiftModal(true);
              }}
              className="px-4 py-2.5 bg-rose-50 text-[#FF0055] hover:bg-[#FF0055] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 border border-rose-100"
              title="Akhiri shift kasir dan rekap kas laci"
            >
              <Clock size={14} />
              Tutup Shift
            </button>

            {/* User */}
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 pl-3 pr-4 py-1.5 rounded-full">
              <div className="w-8 h-8 rounded-full bg-[#FF0055] flex items-center justify-center text-white shrink-0">
                <User size={16} />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[11px] font-black text-slate-800 leading-none">{cashierName || "Kasir Aktif"}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-none">Shift: {shiftStartTime || "-"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-hidden">

          {/* ═══ TAB: KASIR ═══ */}
          {activeTab === "kasir" && (
            <div className="flex h-full animate-in fade-in duration-300">
              {/* Product Grid */}
              <div className="flex-1 flex flex-col bg-[#F4F7FA]">
                {/* Search & Member Lookup */}
                <div className="p-8 pb-2">
                  <div className="flex flex-col md:flex-row gap-4 mb-4 items-stretch">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Cari layanan atau produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-13 pr-10 py-4 rounded-[1.25rem] bg-white border border-slate-200 outline-none text-[15px] font-bold focus:ring-4 focus:ring-rose-50 focus:border-[#FF0055] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-slate-700 placeholder:text-slate-400"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                    {/* Member Phone Input with fuzzy autocomplete */}
                    <div className="w-full md:w-[320px] relative">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Cari Nama / No. Telp VIP..."
                          value={memberPhone}
                          onFocus={() => setShowMemberDropdown(true)}
                          onChange={(e) => {
                            setMemberPhone(e.target.value);
                            setShowMemberDropdown(true);
                            if (activeMember && e.target.value !== activeMember.name) {
                              setActiveMember(null);
                            }
                          }}
                          className="w-full px-5 py-3.5 rounded-[1.25rem] border text-[13px] font-bold outline-none transition-all shadow-sm border-slate-200 bg-white focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 text-slate-700 placeholder:text-slate-400"
                        />
                      </div>
                      
                      {/* Transparent click away overlay */}
                      {showMemberDropdown && (
                        <div className="fixed inset-0 z-[980]" onClick={() => setShowMemberDropdown(false)} />
                      )}
                      
                      {/* Autocomplete Dropdown List */}
                      {showMemberDropdown && memberPhone.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-[990] overflow-hidden max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                          {filteredMembers.length > 0 ? (
                            filteredMembers.map((m) => (
                              <button
                                key={m.phone}
                                type="button"
                                onClick={() => {
                                  setActiveMember(m);
                                  setMemberPhone(m.name);
                                  setShowMemberDropdown(false);
                                  showToast("success", "Anggota VIP Aktif", `${m.name} (${m.phone})`);
                                }}
                                className="w-full px-5 py-3 hover:bg-rose-50/50 text-left transition-colors flex flex-col border-b border-slate-50 last:border-0"
                              >
                                <span className="font-extrabold text-slate-800 text-xs">{m.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold mt-0.5 flex justify-between">
                                  <span>{m.phone}</span>
                                  <span className="text-[#FF0055] font-black">Diskon {m.discount * 100}%</span>
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="px-5 py-4 text-center text-xs font-bold text-slate-450">
                              Tidak ditemukan anggota VIP
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Category Tabs & Active Member Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2 animate-in fade-in duration-300">
                    <div className="flex gap-2">
                      {(["Semua", "Produk", "Layanan"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                            selectedCategory === cat
                              ? "bg-[#FF0055] text-white border-[#FF0055] shadow-md shadow-rose-500/10"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {/* Active Member Display */}
                    {activeMember && (
                      <div className="p-2.5 px-4 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2.5 shadow-sm animate-in zoom-in-95">
                        <UserCheck size={14} className="text-emerald-500" />
                        <span className="text-[12px] font-bold text-emerald-900">
                          VIP: <span className="font-extrabold">{activeMember.name}</span>
                        </span>
                        <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black">
                          -{activeMember.discount * 100}%
                        </span>
                        {activeMember.dob && (
                          <span className="text-[9px] font-semibold text-emerald-700">
                            (Ultah: {formatDOB(activeMember.dob)})
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setActiveMember(null);
                            setMemberPhone("");
                          }}
                          className="text-emerald-400 hover:text-rose-500 text-xs font-bold leading-none ml-1 transition-colors"
                          title="Hapus member"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Cards */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-6 scrollbar-thin">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {filteredInventory.map((item) => (
                      <div key={item.id} className="relative group">
                        <button
                          onClick={() => handleProductClick(item)}
                          className={`w-full h-full min-h-[160px] bg-white border border-slate-200 rounded-[1.5rem] p-4 lg:p-5 text-left transition-all flex flex-col justify-between ${
                            !isService(item) && item.stock <= 0
                              ? "opacity-50 grayscale"
                              : "hover:border-[#FF0055] hover:shadow-[0_10px_30px_rgba(255,0,85,0.06)] hover:-translate-y-1"
                          }`}
                        >
                          <div className="mb-2 lg:mb-4 flex items-center justify-between w-full">
                            {isService(item) ? (
                              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                                <Zap size={16} className="text-violet-500" />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                                <Package size={16} className="text-[#FF0055]" />
                              </div>
                            )}
                            {!isService(item) && item.stock <= 0 && (
                              <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Habis</span>
                            )}
                            {!isService(item) && item.stock > 0 && item.stock <= 5 && (
                              <span className="bg-rose-50 text-[#FF0055] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest animate-pulse border border-rose-100 flex items-center gap-1">
                                <AlertTriangle size={8} /> Stok Kritis ({item.stock})
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-h-0">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">
                              {isService(item) ? "Layanan" : "Produk"}
                            </p>
                            <h3 className="text-[11px] lg:text-[13px] font-bold text-slate-800 leading-tight line-clamp-2">{item.name}</h3>
                          </div>
                          <div className="mt-3 flex items-end justify-between">
                            <p className="text-[13px] lg:text-[16px] font-black text-slate-900">{formatRupiah(item.price)}</p>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-[#FF0055] transition-colors" />
                          </div>
                        </button>
                      </div>
                    ))}

                    {filteredInventory.length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <Search size={40} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-[12px] font-bold text-slate-400 tracking-wider">
                          Tidak ada hasil untuk &quot;{debouncedSearch}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Cart Sidebar ── */}
              <div className="w-[440px] bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-[-4px_0_20px_rgba(0,0,0,0.03)]">
                {/* Cart Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-extrabold text-slate-800 flex items-center gap-3 text-sm tracking-widest uppercase">
                    <ShoppingCart size={18} className="text-[#FF0055]" /> KERANJANG
                  </h2>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{cart.length} Produk</span>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F4F7FA] scrollbar-thin">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <ReceiptText size={64} strokeWidth={1} className="mb-6 opacity-30" />
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-60">Keranjang Kosong</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.cartId} className="flex flex-col gap-3.5 p-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm animate-in slide-in-from-right-4 transition-all">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-[14px] leading-tight break-words">{item.name}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">
                              {item.type} {item.variant !== "Normal" ? `• Varian: ${item.variant}` : ""}
                            </p>
                          </div>
                          <button onClick={() => handleRemoveFromCart(item.cartId)} className="text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 p-1.5 rounded-full shrink-0">
                            <XCircle size={16} />
                          </button>
                        </div>
                        {/* Note Input */}
                        <div className="mt-0.5">
                          <input
                            type="text"
                            placeholder="Tambah catatan pesanan..."
                            value={item.note || ""}
                            onChange={(e) => updateCartItemNote(item.cartId, e.target.value)}
                            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-100 focus:border-[#FF0055] px-3 py-1.5 rounded-lg text-[11px] font-medium outline-none transition-all placeholder:text-slate-300 text-slate-600"
                          />
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-[16px] font-black text-[#FF0055]">{formatRupiah(item.price * item.qty)}</span>
                          <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-1 bg-slate-50">
                            <button onClick={() => updateCartItemQty(item.cartId, item.qty - 1, item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-rose-600 shadow-sm transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="text-[13px] font-bold w-5 text-center text-slate-800 tabular-nums">{item.qty}</span>
                            <button onClick={() => updateCartItemQty(item.cartId, item.qty + 1, item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-emerald-500 shadow-sm transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart Footer */}
                <div className="p-6 bg-white border-t border-slate-200">
                  {/* Voucher Input */}
                  {cart.length > 0 && (
                    <div className="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-150 text-left animate-in slide-in-from-bottom-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Voucher Promosi</label>
                      {appliedVoucher ? (
                        <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 animate-in zoom-in-95">
                          <span className="flex items-center gap-1.5"><Sparkles size={14}/> {appliedVoucher.name} (-{appliedVoucher.value})</span>
                          <button type="button" onClick={() => setAppliedVoucher(null)} className="text-rose-500 hover:text-rose-700 font-extrabold uppercase text-[9px] tracking-widest">Hapus</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Kode Voucher (Contoh: PRM-123)"
                            value={voucherCodeInput}
                            onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs font-bold focus:border-[#FF0055] bg-white uppercase text-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!voucherCodeInput.trim()) return;
                              const savedPromosRaw = localStorage.getItem("skinpos_promos");
                              const promosList = savedPromosRaw ? JSON.parse(savedPromosRaw) : [];
                              const matched = promosList.find((p: any) => p.id === voucherCodeInput.trim() && p.status === "Active");
                              if (matched) {
                                setAppliedVoucher(matched);
                                setVoucherCodeInput("");
                                showToast("success", "Voucher Diterapkan", matched.name);
                              } else {
                                showToast("error", "Gagal", "Kode voucher tidak valid atau tidak aktif.");
                              }
                            }}
                            className="px-4 py-2 bg-slate-800 hover:bg-[#FF0055] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                          >
                            Terapkan
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <span>Subtotal</span>
                    <span className="text-slate-700">{formatRupiah(subtotal)}</span>
                  </div>
                  {activeMember && (
                    <div className="flex justify-between text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-3">
                      <span>Diskon VIP</span>
                      <span>-{formatRupiah(subtotal * activeMember.discount)}</span>
                    </div>
                  )}
                  {appliedVoucher && (
                    <div className="flex justify-between text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-3">
                      <span>Voucher ({appliedVoucher.name})</span>
                      <span>-{formatRupiah(voucherDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="pt-5 border-t border-slate-100 flex justify-between items-end mb-8">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan</span>
                    <span className="text-3xl font-[900] text-slate-900 tracking-tighter tabular-nums">{formatRupiah(grandTotal)}</span>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0 || isProcessingOrder}
                    className={`w-full py-5 rounded-2xl font-black text-[12px] tracking-[0.2em] uppercase flex justify-center items-center gap-2 transition-all ${
                      cart.length === 0
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-[#FF0055] text-white hover:bg-[#D40048] shadow-lg shadow-rose-500/25"
                    }`}
                  >
                    {isProcessingOrder ? <Loader2 size={18} className="animate-spin" /> : "PROSES PEMBAYARAN"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: STOK ═══ */}
          {activeTab === "stok" && (
            <div className="h-full p-10 flex gap-10 bg-[#F4F7FA] overflow-y-auto">
              <div className="w-[380px] shrink-0">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 mb-8 text-sm flex items-center gap-3 uppercase tracking-widest">
                    <Boxes size={20} className="text-[#FF0055]" /> Update Stok
                  </h3>
                  <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
                    <button onClick={() => setStockType("masuk")} className={`flex-1 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${stockType === "masuk" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                      Masuk
                    </button>
                    <button onClick={() => setStockType("keluar")} className={`flex-1 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${stockType === "keluar" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                      Keluar
                    </button>
                  </div>
                  <form onSubmit={handleStockMutation} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Item Produk</label>
                      <select value={stockInput.id} onChange={(e) => setStockInput({ ...stockInput, id: e.target.value })} className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]">
                        <option value="">-- Pilih SKU --</option>
                        {inventory.filter((i) => !isService(i)).map((i) => (
                          <option key={i.id} value={i.id}>{i.name} ({i.id})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Jumlah Produk / Pcs</label>
                      <input type="number" min="1" value={stockInput.qty || ""} onChange={(e) => setStockInput({ ...stockInput, qty: Number(e.target.value) })} className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]" placeholder="0" />
                    </div>
                    {stockType === "masuk" && (
                      <div className="relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Tanggal Kedaluwarsa</label>
                        <div
                          onClick={() => {
                            setShowStockExpPicker(!showStockExpPicker);
                            if (!stockExpYear) {
                              setStockExpYear(String(new Date().getFullYear()));
                            }
                          }}
                          className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-[#FAFAFA] text-[13px] font-bold flex items-center justify-between cursor-pointer hover:border-[#FF0055] transition-all"
                        >
                          <span className={stockInput.expDate ? "text-slate-800" : "text-slate-400"}>
                            {stockInput.expDate || "Pilih Tanggal (DD/MM/YYYY)"}
                          </span>
                          <Calendar size={16} className="text-slate-400" />
                        </div>

                        {showStockExpPicker && (
                          <div className="absolute top-[85px] left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in slide-in-from-top-2 duration-200 space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 pb-2">Pilih Tanggal Kedaluwarsa</p>
                            <div className="flex gap-2">
                              {/* Hari */}
                              <select
                                value={stockExpDay}
                                onChange={(e) => setStockExpDay(e.target.value)}
                                className="flex-1 px-2.5 py-2.5 rounded-xl border border-slate-150 outline-none text-[12px] font-bold focus:border-[#FF0055] bg-[#FAFAFA]"
                              >
                                <option value="">Hari</option>
                                {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>

                              {/* Bulan */}
                              <select
                                value={stockExpMonth}
                                onChange={(e) => setStockExpMonth(e.target.value)}
                                className="flex-1.5 px-2.5 py-2.5 rounded-xl border border-slate-150 outline-none text-[12px] font-bold focus:border-[#FF0055] bg-[#FAFAFA]"
                              >
                                <option value="">Bulan</option>
                                {[
                                  { val: "01", name: "Jan" },
                                  { val: "02", name: "Feb" },
                                  { val: "03", name: "Mar" },
                                  { val: "04", name: "Apr" },
                                  { val: "05", name: "Mei" },
                                  { val: "06", name: "Jun" },
                                  { val: "07", name: "Jul" },
                                  { val: "08", name: "Agt" },
                                  { val: "09", name: "Sep" },
                                  { val: "10", name: "Okt" },
                                  { val: "11", name: "Nov" },
                                  { val: "12", name: "Des" }
                                ].map(m => (
                                  <option key={m.val} value={m.val}>{m.name}</option>
                                ))}
                              </select>

                              {/* Tahun */}
                              <select
                                value={stockExpYear}
                                onChange={(e) => setStockExpYear(e.target.value)}
                                className="flex-1.5 px-2.5 py-2.5 rounded-xl border border-slate-150 outline-none text-[12px] font-bold focus:border-[#FF0055] bg-[#FAFAFA]"
                              >
                                <option value="">Tahun</option>
                                {Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() + i)).map(y => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowStockExpPicker(false)}
                              className="w-full py-2 bg-[#FF0055] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#D40048] transition-all"
                            >
                              Terapkan
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {stockType === "keluar" && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Alasan Keluar</label>
                        <select value={stockInput.reason} onChange={(e) => setStockInput({ ...stockInput, reason: e.target.value })} className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]">
                          <option value="rusak">Barang Rusak</option>
                          <option value="expired">Expired</option>
                          <option value="tester">Tester</option>
                        </select>
                      </div>
                    )}
                    <button type="submit" className="w-full py-5 bg-[#FF0055] text-white rounded-xl font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-[#D40048] shadow-lg shadow-rose-500/20 transition-all mt-4">
                      Simpan Perubahan
                    </button>
                  </form>
                </div>
              </div>
              <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-widest">Status Inventaris</h3>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">Aktif / Terkini</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 border-b border-slate-100">
                        <th className="px-8 py-5">Detail Item</th>
                        <th className="px-8 py-5">Exp.</th>
                        <th className="px-8 py-5 text-center">Status</th>
                        <th className="px-8 py-5 text-right">Stok Fisik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventory.map((i) => (
                        <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="text-[10px] font-black text-[#FF0055] mb-1.5 tracking-wider">{i.id}</p>
                            <p className="text-[13px] font-bold text-slate-800">{i.name}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[12px] font-semibold text-slate-500">{i.exp}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            {isService(i) ? (
                              <span className="text-[9px] font-bold bg-violet-50 text-violet-600 px-3 py-1.5 rounded-lg border border-violet-100 uppercase inline-block">Layanan</span>
                            ) : i.stock < 10 ? (
                              <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 uppercase inline-block">Menipis</span>
                            ) : (
                              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase inline-block">Aman</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right font-black text-slate-800 text-lg">{i.stock > 900 ? "∞" : i.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: RIWAYAT & VOID ═══ */}
          {activeTab === "void" && (
            <div className="h-full p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800">Riwayat Penjualan</h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#FF0055] transition-all shadow-md"
                  >
                    <FileDown size={14} /> Unduh PDF
                  </button>
                  <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                  >
                    <FileSpreadsheet size={14} /> Unduh Excel
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Receipt size={18} className="text-blue-500" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Transaksi</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800">{todayStats.totalTransaksi}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selesai</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">{todayStats.completedCount}</p>
                </div>
              </div>

              {/* Order Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {orders.length === 0 ? (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-200 border-dashed shadow-sm">
                    <History size={48} className="mx-auto text-slate-300 mb-6" />
                    <p className="font-bold text-slate-400 text-sm tracking-widest uppercase">Belum ada riwayat transaksi</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className={`bg-white border border-slate-200 rounded-[2rem] p-8 transition-all hover:border-[#FF0055] shadow-sm hover:shadow-[0_10px_30px_rgba(255,0,85,0.06)] hover:-translate-y-1 ${order.status !== "pending" && "opacity-60 grayscale-[0.2]"}`}>
                      <div className="flex justify-between items-start mb-6 pb-5 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{order.id}</span>
                          <p className="text-[10px] font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
                            <Clock size={12} /> {order.time ? order.time.replace(":", ".") : ""}
                          </p>
                          {order.paymentMethod && (
                            <p className="text-[9px] font-bold text-blue-500 mt-1 uppercase tracking-wider">{order.paymentMethod}</p>
                          )}
                        </div>
                        <p className="text-xl font-black text-slate-800">{formatRupiah(order.grandTotal)}</p>
                      </div>
                      <div className="space-y-3 mb-6 h-24 overflow-y-auto scrollbar-thin">
                        {order.items.map((it: any, idx: number) => (
                          <p key={idx} className="text-[12px] font-bold text-slate-500 flex justify-between">
                            <span>{it.qty}x {it.name} <span className="text-[9px] opacity-70 font-semibold ml-1">({it.variant})</span></span>
                          </p>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        {order.status === "completed" ? (
                          <div className="flex flex-col gap-2">
                            <div className="text-center py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
                              Selesai
                            </div>
                            <button onClick={() => handleVoidRequest(order)} className="w-full text-[11px] font-bold py-2.5 rounded-xl border border-slate-200 text-[#FF0055] hover:bg-rose-50 hover:border-rose-200 transition-all bg-white shadow-sm">
                              Ajukan Pembatalan
                            </button>
                          </div>
                        ) : order.status === "pending_void" ? (
                          <div className="text-center py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border bg-amber-50 text-amber-600 border-amber-100">Menunggu ACC Batal</div>
                        ) : (
                          <div className="text-center py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border bg-rose-50 text-rose-600 border-rose-100">
                            Batal
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ═══ TAB: MEMBERS ═══ */}
          {activeTab === "members" && (
            <div className="h-full p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA] flex gap-8">
              <div className="w-[360px] shrink-0">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                    <UserCheck size={20} className="text-[#FF0055]" /> Tambah Anggota VIP
                  </h3>
                  <form onSubmit={handleAddMember} className="space-y-5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nama Anggota</label>
                      <input type="text" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} placeholder="Masukkan nama" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nomor HP</label>
                      <input type="text" value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value.replace(/\D/g, "") })} placeholder="08..." className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50" />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tanggal Lahir</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="DD / MM / YYYY"
                          value={dobInput}
                          onChange={(e) => setDobInput(formatDOBInput(e.target.value))}
                          className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDobPicker(!showDobPicker)}
                          className="px-4 bg-slate-50 border border-slate-200 hover:border-[#FF0055] text-slate-500 hover:text-[#FF0055] rounded-xl flex items-center justify-center transition-all"
                        >
                          <Calendar size={18} />
                        </button>
                      </div>

                      {showDobPicker && (
                        <div className="absolute top-[80px] left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in slide-in-from-top-2 duration-200 space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 pb-2">Pilih Tanggal Lahir</p>
                          <div className="flex gap-2">
                            {/* Hari */}
                            <select
                              value={dobPickerDay}
                              onChange={(e) => setDobPickerDay(e.target.value)}
                              className="flex-1 px-2.5 py-2.5 rounded-xl border border-slate-150 outline-none text-[12px] font-bold focus:border-[#FF0055] bg-[#FAFAFA]"
                            >
                              <option value="">Hari</option>
                              {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>

                            {/* Bulan */}
                            <select
                              value={dobPickerMonth}
                              onChange={(e) => setDobPickerMonth(e.target.value)}
                              className="flex-1.5 px-2.5 py-2.5 rounded-xl border border-slate-150 outline-none text-[12px] font-bold focus:border-[#FF0055] bg-[#FAFAFA]"
                            >
                              <option value="">Bulan</option>
                              {[
                                { val: "01", name: "Jan" },
                                { val: "02", name: "Feb" },
                                { val: "03", name: "Mar" },
                                { val: "04", name: "Apr" },
                                { val: "05", name: "Mei" },
                                { val: "06", name: "Jun" },
                                { val: "07", name: "Jul" },
                                { val: "08", name: "Agt" },
                                { val: "09", name: "Sep" },
                                { val: "10", name: "Okt" },
                                { val: "11", name: "Nov" },
                                { val: "12", name: "Des" }
                              ].map(m => (
                                <option key={m.val} value={m.val}>{m.name}</option>
                              ))}
                            </select>

                            {/* Tahun */}
                            <select
                              value={dobPickerYear}
                              onChange={(e) => setDobPickerYear(e.target.value)}
                              className="flex-1.5 px-2.5 py-2.5 rounded-xl border border-slate-150 outline-none text-[12px] font-bold focus:border-[#FF0055] bg-[#FAFAFA]"
                            >
                              <option value="">Tahun</option>
                              {Array.from({ length: new Date().getFullYear() - 1939 }, (_, i) => String(new Date().getFullYear() - i)).map(y => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowDobPicker(false)}
                            className="w-full py-2 bg-[#FF0055] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#D40048] transition-all"
                          >
                            Terapkan
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Diskon Standar (%)</label>
                      <input type="number" min="0" max="100" value={newMember.discount} onChange={(e) => setNewMember({ ...newMember, discount: Number(e.target.value) })} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-[#FF0055] shadow-md transition-all mt-2">
                      Simpan Data
                    </button>
                  </form>
                </div>
              </div>
              <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-extrabold text-slate-800">Data Anggota</h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">Total: {members.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        <th className="px-8 py-5">Nama Anggota</th>
                        <th className="px-8 py-5">Nomor HP</th>
                        <th className="px-8 py-5">Tanggal Lahir</th>
                        <th className="px-8 py-5 text-center">Hak Diskon</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 font-bold text-slate-800 text-[13px]">{m.name}</td>
                          <td className="px-8 py-5 font-semibold text-slate-500 text-[12px]">{m.phone}</td>
                          <td className="px-8 py-5 font-semibold text-slate-500 text-[12px]">{formatDOB(m.dob)}</td>
                          <td className="px-8 py-5 text-center">
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[11px] font-black border border-emerald-100">{m.discount * 100}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ MODALS ═══════════ */}

        {/* MODAL PILIHAN METODE PEMBAYARAN */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-[700] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowPaymentModal(false)}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 bg-slate-50 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={24} />
              </div>
              <h3 className="text-center font-black text-slate-800 text-lg mb-1 tracking-tight">METODE PEMBAYARAN</h3>
              <p className="text-center text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Pilih cara pembayaran pelanggan</p>

              <div className="grid grid-cols-4 gap-2.5 mb-6">
                {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(key as any);
                      if (key !== "Cash") setAmountPaid("");
                    }}
                    className={`py-3.5 rounded-xl text-[12px] font-bold transition-all border-2 flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === key ? "border-[#FF0055] bg-rose-50 text-[#FF0055]" : "border-slate-100 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Cash Calculator Section */}
              {paymentMethod === "Cash" && (
                <div className="mb-6 p-5 bg-slate-50 border border-slate-100 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tagihan</span>
                    <span className="text-base font-black text-slate-800">{formatRupiah(grandTotal)}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Uang Diterima (Rp)</label>
                      <input
                        type="text"
                        placeholder="Masukkan nominal uang..."
                        value={amountPaid}
                        onChange={(e) => {
                          setAmountPaid(formatInputRibuan(e.target.value));
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-[15px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-white text-slate-700 text-right"
                      />
                    </div>
                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAmountPaid(formatInputRibuan(String(grandTotal)))}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#FF0055] text-slate-600 hover:text-[#FF0055] rounded-lg text-[10px] font-bold transition-all shadow-sm"
                      >
                        Uang Pas
                      </button>
                      {[50000, 100000, 150000, 200000, 500000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmountPaid(formatInputRibuan(String(preset)))}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#FF0055] text-slate-600 hover:text-[#FF0055] rounded-lg text-[10px] font-bold transition-all shadow-sm"
                        >
                          {formatRupiah(preset)}
                        </button>
                      ))}
                    </div>
                    {/* Calculation Display */}
                    {amountPaid && (
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold transition-all">
                        {parseInputRibuan(amountPaid) >= grandTotal ? (
                          <>
                            <span className="text-emerald-600">Uang Kembalian</span>
                            <span className="text-base font-black text-emerald-600">
                              {formatRupiah(parseInputRibuan(amountPaid) - grandTotal)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-rose-500">Uang Kurang</span>
                            <span className="text-base font-black text-rose-500">
                              {formatRupiah(grandTotal - parseInputRibuan(amountPaid))}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setAmountPaid("");
                  }}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={paymentMethod === "Cash" && (!amountPaid || parseInputRibuan(amountPaid) < grandTotal)}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-white transition-all text-[11px] uppercase tracking-widest shadow-md ${
                    paymentMethod === "Cash" && (!amountPaid || parseInputRibuan(amountPaid) < grandTotal)
                      ? "bg-slate-300 cursor-not-allowed shadow-none"
                      : "bg-[#FF0055] hover:bg-[#D40048] shadow-rose-500/20"
                  }`}
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PILIH VARIAN */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-slate-900/60 z-[700] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setSelectedProduct(null)}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-extrabold text-slate-800 text-lg mb-1">Pilih Varian Item</h3>
              <p className="text-[12px] font-bold text-slate-400 mb-6">{selectedProduct.name}</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {["Normal", "Travel Size"].map((v) => (
                  <button key={v} onClick={() => setSelectedVariant(v)} className={`py-3.5 px-4 rounded-xl border-2 text-[12px] font-bold transition-all ${selectedVariant === v ? "border-[#FF0055] bg-rose-50 text-[#FF0055]" : "border-slate-100 text-slate-500 hover:border-slate-300"}`}>
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedProduct(null)} className="flex-1 py-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest">Batal</button>
                <button onClick={() => processAddToCart(selectedProduct, selectedVariant)} className="flex-1 py-4 rounded-xl font-bold bg-[#FF0055] text-white hover:bg-[#D40048] transition-all text-[11px] uppercase tracking-widest shadow-md">Masuk Keranjang</button>
              </div>
            </div>
          </div>
        )}

        {/* RECEIPT MODAL */}
        {showReceipt && (
          <div className="fixed inset-0 bg-slate-900/60 z-[600] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowReceipt(null)}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} strokeWidth={2} />
              </div>
              <h3 className="text-center font-black text-slate-800 text-lg mb-1 tracking-tight">TRANSAKSI SUKSES</h3>
              <p className="text-center text-[9px] font-bold text-slate-400 mb-4 uppercase tracking-widest">Metode: {showReceipt.paymentMethod}</p>

              <div className="bg-[#F8FAFC] p-4 rounded-2xl font-mono text-[11px] border border-slate-200 space-y-3 mb-6 text-slate-600">
                <p className="text-center font-bold border-b border-dashed border-slate-300 pb-2 mb-2 uppercase tracking-[0.2em] text-slate-400">ESTHETIC ROSEREVE JAPAN</p>
                
                {showReceipt.items.map((c: any) => (
                  <div key={c.cartId} className="border-b border-slate-100/50 pb-2">
                    <div className="flex justify-between font-bold">
                      <span className="flex-1 mr-2">{c.qty}x {c.name} <span className="opacity-70 text-[9px]">({c.variant.slice(0, 3)})</span></span>
                      <span className="shrink-0">{formatRupiah(c.price * c.qty)}</span>
                    </div>
                    {c.note && (
                      <p className="text-[10px] text-slate-400 italic mt-0.5 font-medium leading-relaxed">
                        * Catatan: {c.note}
                      </p>
                    )}
                  </div>
                ))}
                
                {showReceipt.discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600 pt-1">
                    <span>Diskon</span>
                    <span>-{formatRupiah(showReceipt.discountAmount)}</span>
                  </div>
                )}
                
                <div className="border-t border-dashed border-slate-300 pt-2 mt-2 flex justify-between font-black text-slate-800 text-sm">
                  <span>TOTAL</span>
                  <span>{formatRupiah(showReceipt.grandTotal)}</span>
                </div>

                {showReceipt.paymentMethod === "Cash" && showReceipt.amountPaid !== undefined && (
                  <div className="border-t border-slate-200/60 pt-2 space-y-1 text-slate-500 font-semibold text-[10px]">
                    <div className="flex justify-between">
                      <span>Tunai Diterima</span>
                      <span>{formatRupiah(showReceipt.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Kembalian</span>
                      <span>{formatRupiah(showReceipt.changeDue || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePrintReceipt(showReceipt)}
                  className="flex-1 bg-slate-800 text-white py-3.5 rounded-2xl font-black text-[11px] tracking-[0.15em] uppercase hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <ReceiptText size={16} /> CETAK
                </button>
                <button
                  onClick={() => setShowReceipt(null)}
                  className="flex-1 bg-[#FF0055] text-white py-3.5 rounded-2xl font-black text-[11px] tracking-[0.15em] uppercase hover:bg-[#D40048] transition-all shadow-xl shadow-rose-500/20"
                >
                  TUTUP
                </button>
              </div>
            </div>
          </div>
        )}

        {voidTarget && (
          <div className="fixed inset-0 bg-slate-900/60 z-[500] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setVoidTarget(null)}>
            <div className="bg-white rounded-[2rem] w-full max-w-xs p-6 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <AlertTriangle size={32} className="mx-auto text-amber-500 mb-4" />
              <h3 className="text-center font-black text-slate-800 text-md uppercase mb-2">Batal {voidTarget.id}</h3>
              <form onSubmit={submitVoidRequest} className="space-y-4">
                <input type="text" value={voidReason} onChange={(e) => setVoidReason(e.target.value)} autoFocus placeholder="Alasan Batal..." className="w-full text-center text-xs font-bold py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#FF0055] focus:bg-white text-slate-700" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setVoidTarget(null)} className="flex-1 py-2.5 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 text-xs font-bold">Batal</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#FF0055] text-white hover:bg-[#D40048] text-xs font-bold shadow-md">Kirim</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showHelpCenter && (
          <div className="fixed inset-0 bg-slate-900/60 z-[800] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowHelpCenter(false)}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <HelpCircle className="mx-auto text-blue-500 mb-4" size={32} />
              <h3 className="text-center font-black text-slate-800 text-lg mb-4">Pusat Bantuan</h3>
              <div className="space-y-3 mb-6">
                {[
                  { q: "Batal transaksi?", a: "Buka tab Riwayat, pilih transaksi, klik 'Ajukan Batal', isi alasan dan kirim ke Manager." },
                  { q: "Peralatan macet?", a: "Periksa koneksi printer atau hubungi Divisi IT di nomor Ekstensi 101." },
                  { q: "Tambah anggota VIP?", a: "Buka tab Data Anggota, isi formulir lengkap lalu tekan 'Simpan Data'." },
                  { q: "Unduh laporan?", a: "Buka tab Riwayat & Laporan, klik 'Unduh PDF' untuk teks atau 'Unduh Excel' untuk CSV." }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-bold text-xs text-slate-800 mb-1">{item.q}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowHelpCenter(false)} className="w-full py-3 bg-slate-800 hover:bg-[#FF0055] text-white rounded-xl text-xs font-bold shadow-md transition-colors">
                Tutup
              </button>
            </div>
          </div>
        )}

        {showCloseShiftModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-[800] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowCloseShiftModal(false)}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 bg-rose-50 text-[#FF0055] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={24} />
              </div>
              <h3 className="text-center font-black text-slate-800 text-lg mb-1">AKHIRI SHIFT KASIR</h3>
              <p className="text-center text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Rekonsiliasi laci uang tunai</p>
              
              <div className="space-y-4 mb-6 text-xs text-slate-600 font-bold bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span>Kasir Aktif:</span>
                  <span className="text-slate-800 font-black">{cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shift Dimulai:</span>
                  <span className="text-slate-800 font-black">{shiftStartTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Modal Awal (Float):</span>
                  <span className="text-slate-800 font-black">{formatRupiah(initialFloat)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penjualan Tunai Shift:</span>
                  <span className="text-emerald-600 font-black">
                    {formatRupiah(orders.filter(o => o.status === "completed" && o.paymentMethod === "Cash" && o.date === new Date().toLocaleDateString("id-ID")).reduce((sum, o) => sum + (o.grandTotal || 0), 0))}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-black text-slate-800">
                  <span>Total Kas Harapan:</span>
                  <span>{formatRupiah(calculateExpectedCash())}</span>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const actualVal = parseInputRibuan(closeShiftInput.actualCash);
                const expectedVal = calculateExpectedCash();
                const diff = actualVal - expectedVal;
                
                const shiftReport = {
                  cashierName,
                  startTime: shiftStartTime,
                  endTime: new Date().toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                  date: new Date().toLocaleDateString("id-ID"),
                  initialFloat,
                  cashSales: orders.filter(o => o.status === "completed" && o.paymentMethod === "Cash" && o.date === new Date().toLocaleDateString("id-ID")).reduce((sum, o) => sum + (o.grandTotal || 0), 0),
                  expectedCash: expectedVal,
                  actualCash: actualVal,
                  discrepancy: diff,
                  note: closeShiftInput.note || "Tutup shift normal"
                };

                const currentReports = JSON.parse(localStorage.getItem("skinpos_shift_reports") || "[]");
                localStorage.setItem("skinpos_shift_reports", JSON.stringify([shiftReport, ...currentReports]));
                localStorage.removeItem("skinpos_active_shift");
                
                setIsShiftOpen(false);
                setShowCloseShiftModal(false);
                setOpenShiftInput({ cashierName: "", initialFloat: "" });
                showToast("info", "Shift Ditutup", `Laporan shift disimpan. Selisih: ${formatRupiah(diff)}`);
              }} className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Uang Kas Fisik Aktual (Rp)</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nominal uang kas..."
                    value={closeShiftInput.actualCash}
                    onChange={(e) => setCloseShiftInput({ ...closeShiftInput, actualCash: formatInputRibuan(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-[14px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 text-right text-slate-700 bg-[#FAFAFA]"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Catatan / Keterangan</label>
                  <input
                    type="text"
                    placeholder="Catatan opsional..."
                    value={closeShiftInput.note}
                    onChange={(e) => setCloseShiftInput({ ...closeShiftInput, note: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-xs font-bold focus:border-[#FF0055] bg-[#FAFAFA]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCloseShiftModal(false)} className="flex-1 py-3 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 text-xs font-bold transition-all">Batal</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-[#FF0055] text-white hover:bg-[#D40048] text-xs font-bold transition-all shadow-md">Tutup Shift</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {highValueDeleteTarget && (() => {
          const targetItem = cart.find(c => c.cartId === highValueDeleteTarget);
          if (!targetItem) return null;
          return (
            <div className="fixed inset-0 bg-slate-900/60 z-[800] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setHighValueDeleteTarget(null)}>
              <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-rose-50 text-[#FF0055] rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-center font-black text-slate-800 text-base mb-2 uppercase tracking-tight">Hapus Item Bernilai Tinggi?</h3>
                <p className="text-center text-xs text-slate-500 mb-6 leading-relaxed">
                  Anda akan menghapus produk bernilai tinggi dari keranjang:<br/>
                  <span className="font-extrabold text-slate-700 block mt-2 text-[13px]">{targetItem.name} ({targetItem.variant})</span>
                  <span className="font-black text-[#FF0055] block mt-1 text-[15px]">{formatRupiah(targetItem.price * targetItem.qty)}</span>
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setHighValueDeleteTarget(null)} className="flex-1 py-3 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 text-xs font-bold transition-all">Batal</button>
                  <button type="button" onClick={confirmRemoveHighValueItem} className="flex-1 py-3 rounded-xl bg-[#FF0055] text-white hover:bg-[#D40048] text-xs font-bold transition-all shadow-md">Hapus Item</button>
                </div>
              </div>
            </div>
          );
        })()}

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 z-[500] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowLogoutConfirm(false)}>
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-xs shadow-2xl text-center border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <LogOut size={32} className="mx-auto text-[#FF0055] mb-4" />
              <h2 className="text-xl font-black text-slate-800 mb-2">Keluar Sesi Kasir?</h2>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-xs font-bold">Batal</button>
                <button onClick={() => { sessionStorage.clear(); router.push("/"); }} className="flex-1 py-3 rounded-xl bg-[#FF0055] text-white hover:bg-[#D40048] transition-all text-xs font-bold shadow-md">Keluar</button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-[1000] animate-in slide-in-from-bottom-5">
            <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border ${toast.type === "warning" ? "bg-amber-50 border-amber-200" : "bg-slate-900 border-slate-800"}`}>
              {toast.type === "success" ? <CheckCircle2 className="text-emerald-400" size={24} /> : toast.type === "error" ? <XCircle className="text-rose-500" size={24} /> : toast.type === "warning" ? <AlertTriangle className="text-amber-500" size={24} /> : <Info className="text-blue-400" size={24} />}
              <div>
                <h4 className={`font-bold text-[13px] tracking-wide mb-0.5 ${toast.type === "warning" ? "text-amber-900" : "text-white"}`}>{toast.title}</h4>
                <p className={`text-[11px] font-medium ${toast.type === "warning" ? "text-amber-700" : "text-slate-400"}`}>{toast.subtitle}</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}