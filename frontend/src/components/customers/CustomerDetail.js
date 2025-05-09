// src/components/customers/CustomerDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCustomerById, fetchProjects } from '../../api/apiService';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [customerProjects, setCustomerProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCustomerDetails = async () => {
      try {
        // Fetch customer details
        const customerData = await fetchCustomerById(customerId);
        setCustomer(customerData);
        
        // Fetch all projects and filter for this customer
        const projectsData = await fetchProjects();
        const filteredProjects = projectsData.filter(
          (project) => project.customer === parseInt(customerId)
        );
        setCustomerProjects(filteredProjects);
      } catch (err) {
        setError('Error loading customer details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getCustomerDetails();
  }, [customerId]);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!customer) {
    return <div className="alert alert-warning">Customer not found.</div>;
  }

  return (
    <div className="customer-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{customer.company_name}</h1>
        <div>
          <Link to={`/customers/${customerId}/edit`} className="btn btn-warning me-2">
            Edit Customer
          </Link>
          <Link to="/customers" className="btn btn-secondary">
            Back to Customers
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title">Customer Information</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Company Name:</strong> {customer.company_name}</p>
              <p><strong>Point of Contact:</strong> {customer.point_of_contact}</p>
              <p><strong>Email:</strong> <a href={`mailto:${customer.email}`}>{customer.email}</a></p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-info text-white">
          <h3 className="card-title">Projects</h3>
        </div>
        <div className="card-body">
          {customerProjects.length === 0 ? (
            <div className="alert alert-info">
              No projects found for this customer.
              <div className="mt-3">
                <Link to="/projects/new" className="btn btn-primary">
                  Create New Project
                </Link>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>Project ID</th>
                    <th>Project Name</th>
                    <th>Process</th>
                    <th>Equipment Type</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customerProjects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.project_id}</td>
                      <td>{project.project_name}</td>
                      <td>{project.process}</td>
                      <td>{project.equipment_type}</td>
                      <td>{new Date(project.last_updated).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/projects/${project.project_id}`} className="btn btn-sm btn-info">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;