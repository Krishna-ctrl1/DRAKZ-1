// src/components/global/Modal.jsx
import React from 'react';
import '../../styles/global/Modal.css';

const Modal = ({ children, onClose }) => {
  const onContentClick = (e) => e.stopPropagation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={onContentClick}>
        <button className="modal-close-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;