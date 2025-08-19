// src/components/CreateGroupModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateGroupModal({ onClose, refreshGroups }) {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const toggleUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(u => u !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    try {
      await axios.post('http://localhost:5000/api/groups/create', {
        name: groupName,
        members: selectedUsers
      });
      refreshGroups();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create Group</h2>
        <input 
          type="text" 
          placeholder="Group Name" 
          value={groupName} 
          onChange={(e) => setGroupName(e.target.value)} 
          className="w-full border p-2 rounded mb-4"
        />
        <div className="max-h-40 overflow-y-auto mb-4 border rounded p-2">
          {users.map(u => (
            <div key={u._id} className="flex items-center mb-1">
              <input 
                type="checkbox" 
                checked={selectedUsers.includes(u._id)} 
                onChange={() => toggleUser(u._id)} 
                className="mr-2"
              />
              <span>{u.username}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button onClick={createGroup} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Create</button>
        </div>
      </div>
    </div>
  );
}
