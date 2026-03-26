'use client';

// 1. Extract and export the specific chat data shape
export interface ChatData {
  id: string;
  name: string;
  type: 'dm' | 'group';
  avatar?: string;
  last_message_preview?: string;
  last_message_time?: string;
  unread_count?: number;
}

// 2. Tell ChatItemProps to use that new interface
interface ChatItemProps {
  chat: ChatData; 
  onClick: (id: string) => void;
  size?: 'md' | 'sm';
}

const EPOCH = "2000-01-01T00:00:00Z";

export default function ChatItem({ chat, onClick, size = 'md' }: ChatItemProps) {
  const avatarSize = size === 'md' ? 'w-12 h-12' : 'w-10 h-10';
  const hasUnread = (chat.unread_count ?? 0) > 0;
  const showTime = chat.last_message_time && chat.last_message_time !== EPOCH;

  return (
    <div
      onClick={() => onClick(chat.id)}
      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#f2f4f6] cursor-pointer transition-colors"
    >
      {/* Avatar */}
      {chat.type === 'dm' ? (
        <div className={`${avatarSize} rounded-full bg-[#e0e3e5] flex items-center justify-center text-[#0434c6] flex-shrink-0 shadow-sm overflow-hidden border-2 border-white`}>
          {chat.avatar
            ? <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
            : <span className="font-extrabold text-lg">{chat.name.charAt(0).toUpperCase()}</span>
          }
        </div>
      ) : (
        <div className={`${avatarSize} rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[#0434c6] flex-shrink-0 shadow-inner`}>
          <span className="font-extrabold text-lg">{chat.name.charAt(0).toUpperCase()}</span>
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className={`text-sm truncate ${hasUnread ? 'font-extrabold text-[#191c1e]' : 'font-bold text-[#464555]'}`}>
            {chat.name}
          </h4>
          {showTime && (
            <span className={`text-[10px] ${hasUnread ? 'text-[#0434c6] font-bold' : 'text-[#b5b3c3] font-medium'}`}>
              {new Date(chat.last_message_time!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate max-w-[85%] ${hasUnread ? 'text-[#191c1e] font-bold' : 'text-[#777587] font-medium'}`}>
            {chat.last_message_preview}
          </p>
          {hasUnread && (
            <div className="w-4 h-4 rounded-full bg-[#0434c6] text-white flex items-center justify-center text-[9px] font-extrabold shadow-sm">
              {chat.unread_count}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}