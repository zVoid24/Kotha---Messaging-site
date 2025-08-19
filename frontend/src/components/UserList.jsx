// src/components/UserList.jsx
import React from 'react';

export default function UserList({ users, currentFriend, onSelectFriend, unseenCounts }) {
  // Convert unseenCounts array to a map for faster lookup
  const unseenMap = unseenCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {users.map(u => {
        const isSelected = currentFriend?._id === u._id;
        const unseen = unseenMap[u._id] || 0;

        return (
          <div
            key={u._id}
            onClick={() => onSelectFriend(u)}
            className={`flex items-center justify-between p-2 cursor-pointer rounded-xl transition
                        ${isSelected ? 'bg-purple-100' : 'hover:bg-purple-50'}`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-medium">{u.username}</span>
            </div>

            {unseen > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unseen}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
