// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import common components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Import page components
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './components/projects/ProjectDetail';
import ProjectForm from './components/projects/ProjectForm';
import Customers from './pages/Customers';
import CustomerDetail from './components/customers/CustomerDetail';
import CustomerForm from './components/customers/CustomerForm';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Project Routes */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/projects/:projectId/edit" element={<ProjectForm />} />
            
            {/* Customer Routes */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:customerId" element={<CustomerDetail />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;