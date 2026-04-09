export const  openCloudinaryWidget =(onSuccess, options = {})=> {
    if (!window.cloudinary) {
        console.error("Cloudinary script not found. Is it in index.html?");
        return;
    }


    const myCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const myPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const widget = window.cloudinary.createUploadWidget(
        {
            cloudName: myCloudName,
            uploadPreset: myPreset,
            sources: ["local", "url", "camera"],
            multiple: false,
            cropping: options.cropping ?? true,
            clientAllowedFormats: ["jpg", "png", "jpeg", "pdf"],
            // so widget stays on top of other elements
            zIndex: 2000
        },
        (error, result) => {
            if (!error && result && result.event === "success") {
                onSuccess(result.info.secure_url);
            }
            if (error) {
                console.error("Cloudinary Widget Error:", error);
            }
        }
    );

    // Open immediately after creation
    widget.open();
};