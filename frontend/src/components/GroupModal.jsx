import { useState } from 'react';
import axios from 'axios';

export default function GroupModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState([]); 
  const [users, setUsers] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));

  
  useState(() => {
    axios.get('http://localhost:5000/api/auth/users')
      .then(res => setUsers(res.data.filter(u => u._id !== user.id)))
      .catch(console.error);
  }, []);

  const createGroup = async () => {
    try {
      if (!name || members.length === 0) return alert('Enter name & select members');
      await axios.post('http://localhost:5000/api/groups', {
        name,
        members: [user.id, ...members],
        admin: user.id
      });
      onCreated();  // refresh groups in parent
      onClose();    // close modal
    } catch (err) {
      console.error(err);
      alert('Failed to create group');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-96 p-4">
        <h2 className="text-xl font-bold mb-2">Create Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        />
        <div className="max-h-40 overflow-y-auto mb-2">
          {users.map(u => (
            <div key={u._id} className="flex items-center mb-1">
              <input
                type="checkbox"
                value={u._id}
                onChange={e => {
                  if (e.target.checked) setMembers([...members, u._id]);
                  else setMembers(members.filter(id => id !== u._id));
                }}
              />
              <span className="ml-2">{u.username}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-300">Cancel</button>
          <button onClick={createGroup} className="px-3 py-1 rounded bg-blue-500 text-white">Create</button>
        </div>
      </div>
    </div>
  );
}
