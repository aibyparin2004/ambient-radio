"use client";

/**
 * Automatically resizes and compresses user-selected images in the browser canvas 
 * down to crisp HD WebP/JPEG format (~200KB - 500KB) before uploading to serverless API.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> {
  // Return video files as is
  if (file.type.startsWith("video/")) {
    return file;
  }

  // Only compress images
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      // Maintain aspect ratio while scaling down to max HD bounds
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw and render compressed image
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Create new compressed File object
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, "") + ".webp",
            {
              type: "image/webp",
              lastModified: Date.now(),
            }
          );

          resolve(compressedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
