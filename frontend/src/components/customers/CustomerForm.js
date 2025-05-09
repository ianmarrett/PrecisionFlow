// src/components/customers/CustomerForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCustomerById, createCustomer } from '../../api/apiService';

const CustomerForm = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(customerId);

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    point_of_contact: '',
    email: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load customer data if in edit mode
  useEffect(() => {
    const loadCustomerData = async () => {
      if (isEditMode) {
        setLoading(true);
        try {
          const customerData = await fetchCustomerById(customerId);
          setFormData({
            company_name: customerData.company_name || '',
            point_of_contact: customerData.point_of_contact || '',
            email: customerData.email || '',
          });
        } catch (err) {
          setError('Error loading customer data. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadCustomerData();
  }, [customerId, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For simplicity, we'll just create new customers in this example
      if (!isEditMode) {
        await createCustomer(formData);
      } else {
        // Add updateCustomer API call for edit mode
        // await updateCustomer(customerId, formData);
      }

      setSuccess(true);

      // Redirect after a brief success message
      setTimeout(() => {
        navigate('/customers');
      }, 1500);
    } catch (err) {
      setError('Error saving customer. Please check your input and try again.');
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h2>{isEditMode ? 'Edit Customer' : 'Create New Customer'}</h2>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Customer {isEditMode ? 'updated' : 'created'} successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="company_name" className="form-label">Company Name</label>
            <input
              type="text"
              className="form-control"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="point_of_contact" className="form-label">Point of Contact</label>
            <input
              type="text"
              className="form-control"
              id="point_of_contact"
              name="point_of_contact"
              value={formData.point_of_contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={() => navigate('/customers')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;