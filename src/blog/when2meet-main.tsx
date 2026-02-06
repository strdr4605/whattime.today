import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { When2MeetAlternatives } from './When2MeetAlternatives'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <When2MeetAlternatives />
  </StrictMode>,
)
