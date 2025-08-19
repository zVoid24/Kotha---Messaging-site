// src/components/Header.jsx
import React from 'react';

export default function Header({ friend, onLogout }) {
  return (
    <div className="p-4 border-b flex justify-between items-center bg-gray-100 shadow-sm">
      <h2 className="font-bold text-lg">{friend ? friend.username : 'Select a user'}</h2>
     
       
    </div>
  );
}
