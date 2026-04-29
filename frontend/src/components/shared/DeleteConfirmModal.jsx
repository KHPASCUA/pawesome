import React from "react";
import "./DeleteConfirmModal.css";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  itemName = "this item",
}) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div
        className="delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-modal-header">
          <div className="delete-icon">🗑</div>
          <h3>Delete Product</h3>
        </div>

        <div className="delete-modal-body">
          <p>
            Are you sure you want to delete{" "}
            <strong>{itemName}</strong>?
          </p>
          <span>This action cannot be undone.</span>
        </div>

        <div className="delete-modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="btn-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
