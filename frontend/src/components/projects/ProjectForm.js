// src/components/projects/ProjectForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProjectById, createProject, updateProject, fetchCustomers } from '../../api/apiService';

const ProjectForm = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(projectId);

  // Form state
  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    customer: '',
    equipment_type: '',
    process: '',
    substrate: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Equipment type options from model
  const equipmentTypes = [
    { value: 'rack', label: 'Rack' },
    { value: 'barrel', label: 'Barrel' },
    { value: 'reel_to_reel', label: 'Reel to Reel' },
    { value: 'roll_to_roll', label: 'Roll to Roll' },
    { value: 'other', label: 'Other' },
  ];

  // Load project data if in edit mode
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load customers
        const customersData = await fetchCustomers();
        setCustomers(customersData);
        
        // If editing, fetch project data
        if (isEditMode) {
          const projectData = await fetchProjectById(projectId);
          
          // Fill the form with project data
          setFormData({
            project_id: projectData.project_id || '',
            project_name: projectData.project_name || '',
            customer: projectData.customer || '',
            equipment_type: projectData.equipment_type || '',
            process: projectData.process || '',
            substrate: projectData.substrate || '',
          });
        }
      } catch (err) {
        setError('Error loading data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [projectId, isEditMode]);

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
      if (isEditMode) {
        await updateProject(projectId, formData);
      } else {
        await createProject(formData);
      }
      
      setSuccess(true);
      
      // Redirect after a brief success message
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (err) {
      setError('Error saving project. Please check your input and try again.');
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h2>{isEditMode ? 'Edit Project' : 'Create New Project'}</h2>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Project {isEditMode ? 'updated' : 'created'} successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="project_id" className="form-label">Project ID</label>
              <input
                type="text"
                className="form-control"
                id="project_id"
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                required
                disabled={isEditMode} // Can't change ID in edit mode
              />
              {isEditMode && <small className="text-muted">Project ID cannot be changed</small>}
            </div>
            
            <div className="col-md-6">
              <label htmlFor="project_name" className="form-label">Project Name</label>
              <input
                type="text"
                className="form-control"
                id="project_name"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="customer" className="form-label">Customer</label>
              <select
                className="form-select"
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company_name} ({customer.point_of_contact})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-6">
              <label htmlFor="equipment_type" className="form-label">Equipment Type</label>
              <select
                className="form-select"
                id="equipment_type"
                name="equipment_type"
                value={formData.equipment_type}
                onChange={handleChange}
              >
                <option value="">Select equipment type</option>
                {equipmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="process" className="form-label">Process</label>
              <input
                type="text"
                className="form-control"
                id="process"
                name="process"
                value={formData.process}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="substrate" className="form-label">Substrate</label>
              <input
                type="text"
                className="form-control"
                id="substrate"
                name="substrate"
                value={formData.substrate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={() => navigate('/projects')}
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
                'Save Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;