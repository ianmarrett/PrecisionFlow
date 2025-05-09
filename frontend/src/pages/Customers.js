// src/pages/Customers.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import { fetchCustomers } from '../api/apiService';
import CustomerList from '../components/customers/CustomerList';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const data = await fetchCustomers();
        setCustomers(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading customers. Please try again later.');
        setLoading(false);
      }
    };

    getCustomers();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="customers-page">
      <Header 
        title="Customers" 
        subtitle="Manage your customer database" 
      />
      
      <div className="d-flex justify-content-end mb-4">
        <Link to="/customers/new" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i> New Customer
        </Link>
      </div>
      
      {customers.length === 0 ? (
        <div className="alert alert-info">
          No customers found. Click 'New Customer' to create one.
        </div>
      ) : (
        <CustomerList customers={customers} />
      )}
    </div>
  );
};

export default Customers;