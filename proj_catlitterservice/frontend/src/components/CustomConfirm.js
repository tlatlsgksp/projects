import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import React from 'react';

export const showConfirm = ({
  title = '확인',
  message = '정말 진행하시겠어요?',
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
}) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      // confirm 창 넓히기 강제 적용
      setTimeout(() => {
        const el = document.querySelector('.react-confirm-alert');
        if (el) {
          el.style.width = '100%';
          el.style.maxWidth = '500px';
          el.style.minWidth = 'unset';
        }
      }, 0);

      return (
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
            fontFamily: 'inherit',
            textAlign: 'center',
          }}
        >
          <h1 className="text-lg font-bold text-gray-800 mb-4">{title}</h1>

          <div className="text-sm text-gray-600 mb-6">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>

          <div className="flex justify-center gap-3 text-sm">
            <button
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              {cancelText}
            </button>
          </div>
        </div>
      );
    },
    closeOnClickOutside: false,
  });
};