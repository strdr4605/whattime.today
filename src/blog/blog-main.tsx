import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { BlogList } from './BlogList'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlogList />
  </StrictMode>,
)
