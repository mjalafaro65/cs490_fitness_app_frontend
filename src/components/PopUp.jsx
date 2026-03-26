import React from "react";

const PopUp = ({ isOpen, onClose, children }) => {
    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1">X</button>
            {children}
            </div>
        </div>
    );
}

export default PopUp;