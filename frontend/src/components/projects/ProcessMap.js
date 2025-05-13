import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProjectById, fetchProcessMap, createProcessMapEntry, updateProcessMapEntry, deleteProcessMapEntry } from '../../api/apiService';

const ProcessMap = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [processMapEntries, setProcessMapEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for adding/editing entries
  const [formData, setFormData] = useState({
    station_number: '',
    process_step: '',
    process: '',
    dwell_time: ''
  });
  
  const [editMode, setEditMode] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch project details
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);
        
        // Fetch process map entries
        const processMapData = await fetchProcessMap(projectId);
        setProcessMapEntries(processMapData);
      } catch (err) {
        setError('Error loading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [projectId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        // Update existing entry
        const updatedEntry = await updateProcessMapEntry(projectId, {
          id: currentEntryId,
          ...formData
        });
        
        // Update the local state
        setProcessMapEntries(processMapEntries.map(entry => 
          entry.id === currentEntryId ? updatedEntry : entry
        ));
        
        // Reset form and edit mode
        setEditMode(false);
        setCurrentEntryId(null);
      } else {
        // Create new entry
        const newEntry = await createProcessMapEntry(projectId, formData);
        
        // Add to local state
        setProcessMapEntries([...processMapEntries, newEntry]);
      }
      
      // Clear form
      setFormData({
        station_number: '',
        process_step: '',
        process: '',
        dwell_time: ''
      });
    } catch (err) {
      setError('Error saving process map entry. Please try again.');
    }
  };
  
  const handleEdit = (entry) => {
    setFormData({
      station_number: entry.station_number,
      process_step: entry.process_step,
      process: entry.process,
      dwell_time: entry.dwell_time
    });
    setEditMode(true);
    setCurrentEntryId(entry.id);
  };
  
  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteProcessMapEntry(projectId, entryId);
        
        // Remove from local state
        setProcessMapEntries(processMapEntries.filter(entry => entry.id !== entryId));
      } catch (err) {
        setError('Error deleting process map entry. Please try again.');
      }
    }
  };
  
  const cancelEdit = () => {
    setFormData({
      station_number: '',
      process_step: '',
      process: '',
      dwell_time: ''
    });
    setEditMode(false);
    setCurrentEntryId(null);
  };
  
  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  if (!project) {
    return <div className="alert alert-warning">Project not found.</div>;
  }
  
  return (
    <div className="process-map">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Process Map - {project.project_name}</h1>
        <div>
          <Link to={`/projects/${projectId}`} className="btn btn-secondary">
            Back to Project
          </Link>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title">Add Process Step</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-2">
                <label htmlFor="station_number" className="form-label">Station #</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="station_number" 
                  name="station_number" 
                  value={formData.station_number} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-5">
                <label htmlFor="process_step" className="form-label">Process Step</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="process_step" 
                  name="process_step" 
                  value={formData.process_step} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-5">
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
              <div className="col-md-3">
                <label htmlFor="dwell_time" className="form-label">Dwell Time (sec)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="dwell_time" 
                  name="dwell_time" 
                  value={formData.dwell_time} 
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="d-flex justify-content-end">
              {editMode && (
                <button type="button" className="btn btn-secondary me-2" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {editMode ? 'Update Step' : 'Add Step'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header bg-success text-white">
          <h3 className="card-title">Process Map</h3>
        </div>
        <div className="card-body">
          {processMapEntries.length === 0 ? (
            <div className="alert alert-info">
              No process steps have been added yet. Use the form above to add steps.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>Station #</th>
                    <th>Process Step</th>
                    <th>Process</th>
                    <th>Dwell Time (sec)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processMapEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.station_number}</td>
                      <td>{entry.process_step}</td>
                      <td>{entry.process}</td>
                      <td>{entry.dwell_time}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-warning me-2" 
                          onClick={() => handleEdit(entry)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(entry.id)}
                        >
                          Delete
                        </button>
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

export default ProcessMap;