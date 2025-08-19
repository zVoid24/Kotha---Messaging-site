// src/components/GroupList.jsx
import React from 'react';

export default function GroupList({ groups, currentGroup, onSelectGroup }) {
  return (
    <div className="mt-4">
      <h3 className="px-4 text-gray-500 uppercase text-sm font-semibold mb-2">Groups</h3>
      <ul>
        {groups.map(group => (
          <li 
            key={group._id} 
            onClick={() => onSelectGroup(group)}
            className={`cursor-pointer px-4 py-2 rounded mb-1 ${
              currentGroup?._id === group._id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
            }`}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
