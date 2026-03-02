import React from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/Main/Main'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { Context } from './context/Context';
import Auth from './Auth';
const App = () => {
  const { user } = useContext(Context);
  return (
   <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" />} />

        {/* PRIVATE ROUTES (Main App) */}
        <Route 
          path="/" 
          element={
            user ? (
              <div className="flex animate-fadeIn w-full h-screen bg-slate-50 dark:bg-slate-950">
                <Sidebar />
                <Main />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Handle 404s */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
