// src/components/ProfileModal.jsx
import React from 'react';

export default function ProfileModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">Profile</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user.id}</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Close</button>
        </div>
      </div>
    </div>
  );
}
