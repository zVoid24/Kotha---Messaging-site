import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import UserList from '../components/UserList';
import ChatBox from '../components/ChatBox';
import MessageInput from '../components/MessageInput';
import Header from '../components/Header';
import GroupModal from '../components/GroupModal';

const socket = io('http://localhost:5000');

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentFriend, setCurrentFriend] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [unseenCounts, setUnseenCounts] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const chatEndRef = useRef(null);

  // Join personal room
  useEffect(() => {
    socket.emit('join', user.id);
  }, [user.id]);

  // Fetch users
  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/users')
      .then(res => setUsers(res.data.filter(u => u._id !== user.id)))
      .catch(console.error);
  }, [user.id]);

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/groups/${user.id}`);
      setGroups(res.data);
    } catch (err) { console.error(err); }
  };
  useEffect(() => { fetchGroups(); }, []);

  // Fetch messages
  const fetchMessages = async (friend = null, group = null) => {
    try {
      let res;
      if (group) res = await axios.get(`http://localhost:5000/api/messages/group/${group._id}`);
      else if (friend) res = await axios.get(`http://localhost:5000/api/messages/${user.id}/${friend._id}`);
      setMessages(res.data);
    } catch (err) { console.error(err); setMessages([]); }
  };

  // Socket listeners
  useEffect(() => {
    const handleReceive = (msg) => {
      // Convert ObjectId to string for comparison
      const msgGroup = msg.group ? msg.group.toString() : null;
      const msgSender = msg.sender ? msg.sender.toString() : null;

      // Private message to current friend
      if (currentFriend && !msgGroup && msgSender === currentFriend._id) {
        setMessages(prev => [...prev, msg]);
      }
      // Group message to current group
      if (currentGroup && msgGroup === currentGroup._id) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('receiveMessage', handleReceive);

    return () => socket.off('receiveMessage', handleReceive);
  }, [currentFriend, currentGroup]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectFriend = (friend) => {
    setCurrentGroup(null);
    setCurrentFriend(friend);
    fetchMessages(friend, null);
  };

  const selectGroup = (group) => {
    setCurrentFriend(null);
    setCurrentGroup(group);
    fetchMessages(null, group);
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg = {
      sender: user.id,
      text,
      receiver: currentFriend ? currentFriend._id : null,
      group: currentGroup ? currentGroup._id : null,
      createdAt: new Date(),
      seen: false
    };
    socket.emit('sendMessage', msg);
    setMessages(prev => [...prev, msg]); // add message locally immediately
    setText('');
  };

  const logout = () => { localStorage.removeItem('user'); window.location.href = '/'; };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">Contacts</h2>
          <UserList users={users} currentFriend={currentFriend} onSelectFriend={selectFriend} unseenCounts={unseenCounts} />

          <h2 className="text-xl font-bold mt-6 mb-2">Groups</h2>
          <div>
            {groups.map(g => (
              <div key={g._id}
                   className={`p-2 cursor-pointer rounded ${currentGroup?._id === g._id ? 'bg-blue-200' : ''}`}
                   onClick={() => selectGroup(g)}>
                {g.name}
              </div>
            ))}
            <button onClick={() => setShowGroupModal(true)}
                    className="mt-2 p-2 w-full bg-blue-500 text-white rounded">
              + Create Group
            </button>
          </div>
        </div>
        <button onClick={logout} className="mt-4 p-2 bg-red-500 text-white rounded">Logout</button>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <Header friend={currentFriend} group={currentGroup} />
        <div className="flex-1 overflow-y-auto p-4">
          <ChatBox messages={messages} currentUserId={user.id} />
          <div ref={chatEndRef} />
        </div>
        {(currentFriend || currentGroup) && (
          <div className="p-4 bg-white shadow-inner">
            <MessageInput text={text} onChange={setText} onSend={sendMessage} />
          </div>
        )}
      </div>

      {/* Group Modal */}
      {showGroupModal && <GroupModal onClose={() => setShowGroupModal(false)} onCreated={fetchGroups} />}
    </div>
  );
}
