import React from 'react';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex justify-end mb-3 animate-slide-up">
        <div className="max-w-[75%]">
          <div
            className="px-4 py-2.5 rounded-xl rounded-br-sm text-sm leading-relaxed"
            style={{ background: '#E8601C', color: '#fff' }}
          >
            {message.text}
          </div>
          <p className="text-right text-[10px] mt-1 pr-1" style={{ color: '#A8A29E' }}>{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 mb-3 animate-slide-up">
      {/* Avatar: a small JS monogram, not a robot emoji */}
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
        style={{ background: 'linear-gradient(135deg, #1A2A6C, #2E4BC6)' }}
      >
        JS
      </div>
      <div className="max-w-[78%]">
        <div
          className="px-4 py-2.5 rounded-xl rounded-tl-sm text-sm leading-relaxed"
          style={{
            background: '#fff',
            border: '1px solid #E5E2DC',
            color: '#1C1917',
          }}
        >
          {message.text}
        </div>
        <p className="text-[10px] mt-1 pl-1" style={{ color: '#A8A29E' }}>{time}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
