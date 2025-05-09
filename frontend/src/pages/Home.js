// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';

const Home = () => {
  return (
    <div>
      <Header 
        title="PrecisionFlow" 
        subtitle="Streamline your electroplating equipment quoting process" 
      />
      
      <div className="jumbotron text-center">
        <p className="lead">
          A custom quoting platform for electroplating equipment manufacturing.
        </p>
        <hr className="my-4" />
        <p>
          Manage projects, customers, process maps, and generate accurate quotes with our intuitive interface.
        </p>
        <div className="mt-4">
          <Link to="/projects" className="btn btn-primary me-3">
            View Projects
          </Link>
          <Link to="/projects/new" className="btn btn-success me-3">
            Create New Project
          </Link>
          <Link to="/customers" className="btn btn-info">
            Manage Customers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;