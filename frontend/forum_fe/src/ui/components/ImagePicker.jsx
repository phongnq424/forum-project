import { useImperativeHandle, useRef, useState } from "react";
import { FaImage } from "react-icons/fa6";

export default function ImagePicker({ onChange, variant, outRef }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const variants = {
    avatar: (
      <img
        src={preview}
        alt="preview"
        className="object-cover w-full h-full rounded-full bg-gray-400"
      />
    ),

    cover: (
      <img
        src={preview}
        alt="preview"
        className="object-cover w-full h-full rounded-4xl bg-white/40"
      />
    ),

    post: <FaImage className="text-white w-full h-full" />,
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onChange?.(file);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 w-full h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current.click()}
        className="w-full h-full cursor-pointer overflow-hidden flex items-center justify-center transition"
      >
        {variants[variant]}
      </div>
    </div>
  );
}
