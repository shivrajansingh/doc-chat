import React, { useState } from 'react';

const ChatComponent = () => {
  const [inputText, setInputText] = useState('');
  const [api_url] = useState(process.env.REACT_APP_API_URL);
  const [chatMessages, setChatMessages] = useState([]);

  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!inputText.trim()) return;

    // Add user message to chatMessages
    setChatMessages(prevMessages => [
      { sender: 'You', message: inputText }, 
      ...prevMessages
    ]);

    setInputText('');

    // Send user message to the server
    const response = await fetch(api_url+'/get-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: inputText })
    });

    // Receive and add system response to chatMessages
    const responseData = await response.json();
    setChatMessages(prevMessages => [
      { sender: 'System', message: responseData.message },
      ...prevMessages
    ]);
  };

  return (
    <div className="col-xs-8">
      <div className="chat-wrapper">
        <div className="chat-content">
          <form onSubmit={handleSubmit}>
            <span className="chat-input">
              <input
                className="form-control pull-right"
                type="text"
                value={inputText}
                onChange={handleChange}
                placeholder="Type your message here..."
              />
            </span>
          </form>
        </div>
        {/* Render chat messages */}
        {chatMessages.map((chat, index) => (
          <div key={index} className={`chat-content ${chat.sender === 'You' ? 'left' : 'right'}`}>
            <div className={`chat-bubble ${chat.sender === 'You' ? 'left' : 'pull-right right'}`}>
              <p className="m-b-0">
                <strong>{chat.sender}:</strong> {chat.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatComponent;
