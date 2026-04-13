import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary dari .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageBuffer(buffer: Buffer, folder: string): Promise<string> {
  const dataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;

  // Ini membungkus upload stream cloudinary jadi promise biar bisa di-await
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(dataUri, {
      folder: folder,
      resource_type: "image",
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result?.secure_url || "");
    });
  });
}

// INI PENTING: Harus di-export biar report.actions.ts tidak error
export const REPORT_FOLDER = "laporpak_reports";