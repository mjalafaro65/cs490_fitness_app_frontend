function Confirm({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-4 rounded w-80">
        
        <p className="text-sm mb-4">{message}</p>

        <div className="flex justify-end gap-2">
          <button className="btn btn-xs" onClick={onCancel}>
            Cancel
          </button>

          <button className="btn btn-xs bg-red-600 text-white" onClick={onConfirm}>
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}

export default Confirm;