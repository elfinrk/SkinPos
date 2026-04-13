"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX ICON LEAFLET ---
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface MapPickerProps {
  onLocationSelect: (location: LocationData) => void;
}

// 1. Komponen untuk menggeser view peta secara programmatis
function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    // "flyTo" bikin animasi geser yang halus
    map.flyTo([center.lat, center.lng], 16); // Zoom level 16 biar lebih dekat
  }, [center, map]);
  return null;
}

// 2. Komponen Handler Klik Manual
function LocationMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  // Default: Monas (Kalau GPS ditolak)
  const DEFAULT_CENTER = { lat: -6.175392, lng: 106.827153 };
  
  // State posisi marker & view peta
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [viewCenter, setViewCenter] = useState(DEFAULT_CENTER);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Fungsi ambil alamat (Reverse Geocoding)
  const fetchAddress = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      const address = data.display_name || "Alamat tidak ditemukan";
      onLocationSelect({ lat, lng, address });
    } catch (error) {
      console.error("Error geocoding:", error);
      onLocationSelect({ lat, lng, address: "Gagal mengambil alamat otomatis" });
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    fetchAddress(lat, lng);
  };

  // Fungsi cari lokasi GPS User
  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setLoadingAddress(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          
          // Update view dan marker
          setViewCenter({ lat: latitude, lng: longitude });
          setPosition({ lat: latitude, lng: longitude });
          
          // Ambil alamatnya sekalian
          fetchAddress(latitude, longitude);
        },
        (err) => {
          console.error("Gagal dapat lokasi:", err);
          alert("Gagal mendeteksi lokasi. Pastikan GPS aktif dan izin diberikan.");
          setLoadingAddress(false);
        }
      );
    } else {
      alert("Browser tidak support GPS.");
    }
  };

  // 3. AUTO DETECT SAAT PERTAMA KALI DIBUKA
  useEffect(() => {
    handleGetLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-[300px] z-0 bg-slate-100">
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Update view peta kalau viewCenter berubah */}
        <MapUpdater center={viewCenter} />
        
        {/* Handle klik manual */}
        <LocationMarker onSelect={handleMapClick} />

        {/* Marker */}
        {position && (
          <Marker position={[position.lat, position.lng]} icon={customIcon} />
        )}
      </MapContainer>

      {/* --- TOMBOL LOKASI SAYA --- */}
      <button
        type="button" // PENTING: biar gak mensubmit form saat diklik
        onClick={handleGetLocation}
        className="absolute top-2 right-2 z-[999] bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 text-slate-700 border border-slate-200"
        title="Gunakan Lokasi Saya"
      >
        📍 Lokasi Saya
      </button>

      {/* Indikator Loading */}
      {loadingAddress && (
        <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-md shadow text-xs font-semibold text-slate-600 z-[999]">
          Sedang memuat lokasi...
        </div>
      )}
    </div>
  );
}