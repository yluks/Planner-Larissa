import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PlannerProvider } from './store'
import { PomodoroProvider } from './pomodoro'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PlannerProvider>
      <PomodoroProvider>
        <App />
      </PomodoroProvider>
    </PlannerProvider>
  </React.StrictMode>,
)
