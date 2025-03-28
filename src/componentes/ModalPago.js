import React from "react";
import "../hoja-de-estilos/ModalPago.css";

export default function ModalPago({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    X
                </button>
                {children}
            </div>
        </div>
    );
}
