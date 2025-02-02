import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ChatPage from './app/chat/page'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App>
      <ChatPage />
    </App>
  </React.StrictMode>,
) 