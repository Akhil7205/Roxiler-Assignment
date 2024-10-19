import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Header from './Component/Header/Header.jsx'
import MainTable from './Component/Main/MainTable.jsx'
import TransactionsTable from './api-to-mongo/TrasitationTable/Table.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Header/> */}
    <App />
    {/* <MainTable/> */}
    <TransactionsTable/>
  </StrictMode>,
)
