import { useEffect, useRef } from "react";

function ImageUpload({ onUploadSuccess }) {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget({
      cloudName: 'YOUR_CLOUD_NAME', // Get this from Cloudinary Dashboard
      uploadPreset: 'YOUR_PRESET_NAME', // Set this in Cloudinary Settings -> Upload
      multiple: false,  // Only one profile pic at a time
      maxFiles: 1,
      clientAllowedFormats: ["jpg", "png", "jpeg", "pdf"],
    }, (error, result) => {
      if (!error && result && result.event === "success") { 
        console.log("Done! Here is the image info: ", result.info);
        onUploadSuccess(result.info.public_id); // Pass the ID back to your page
      }
    });
  }, []);

  return (
    <button 
      type="button"
      className="btn btn-outline border-blue-800 text-blue-800 hover:bg-blue-800"
      onClick={() => widgetRef.current.open()}
    >
      Upload Photo
    </button>
  );
}

export default ImageUpload;