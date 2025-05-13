// src/components/projects/ProcessMap.js (updated version)
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProjectById, fetchProcessMap, createProcessMapEntry, updateProcessMapEntry, deleteProcessMapEntry, runQuickSimulation } from '../../api/apiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faClock, faIndustry } from '@fortawesome/free-solid-svg-icons';

const ProcessMap = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // State for process map data
  const [project, setProject] = useState(null);
  const [processMapEntries, setProcessMapEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for the collapsible simulation panel
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  
  // Form state for adding/editing entries
  const [formData, setFormData] = useState({
    station_number: '',
    process_step: '',
    process: '',
    dwell_time: '',
    drip_time: '0',
    min_dwell_time: '',
    max_dwell_time: '',
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
        dwell_time: '',
        drip_time: '0',
        min_dwell_time: '',
        max_dwell_time: '',
      });
      
      // Run a quick simulation to update results if the simulation panel is open
      if (showSimulation) {
        handleRunQuickSimulation();
      }
    } catch (err) {
      setError('Error saving process map entry. Please try again.');
    }
  };
  
  const handleEdit = (entry) => {
    setFormData({
      station_number: entry.station_number,
      process_step: entry.process_step,
      process: entry.process,
      dwell_time: entry.dwell_time || '',
      drip_time: entry.drip_time || '0',
      min_dwell_time: entry.min_dwell_time || '',
      max_dwell_time: entry.max_dwell_time || '',
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
        
        // Run a quick simulation to update results if the simulation panel is open
        if (showSimulation) {
          handleRunQuickSimulation();
        }
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
      dwell_time: '',
      drip_time: '0',
      min_dwell_time: '',
      max_dwell_time: '',
    });
    setEditMode(false);
    setCurrentEntryId(null);
  };
  
  const handleRunQuickSimulation = async () => {
    if (processMapEntries.length === 0) {
      setError('Cannot run simulation without process map entries.');
      return;
    }
    
    setSimulationLoading(true);
    try {
      const results = await runQuickSimulation(projectId);
      setSimulationResults(results);
      setError(null);
    } catch (err) {
      setError('Error running simulation. Please try again later.');
    } finally {
      setSimulationLoading(false);
    }
  };
  
  const toggleSimulation = () => {
    setShowSimulation(!showSimulation);
    if (!showSimulation && !simulationResults) {
      // Run simulation when opening the panel for the first time
      handleRunQuickSimulation();
    }
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
          <button 
            className="btn btn-info me-2" 
            onClick={toggleSimulation}
          >
            <FontAwesomeIcon icon={faIndustry} className="me-1" />
            {showSimulation ? 'Hide Simulation' : 'Show Simulation'}
          </button>
          <Link to={`/projects/${projectId}/simulation`} className="btn btn-success me-2">
            <FontAwesomeIcon icon={faClock} className="me-1" />
            Full Simulation
          </Link>
          <Link to={`/projects/${projectId}`} className="btn btn-secondary">
            Back to Project
          </Link>
        </div>
      </div>
      
      {/* Collapsible Simulation Panel */}
      {showSimulation && (
        <div className="card mb-4">
          <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h3 className="card-title mb-0">Quick Production Simulation</h3>
            <button 
              className="btn btn-outline-light btn-sm" 
              onClick={handleRunQuickSimulation}
              disabled={simulationLoading}
            >
              {simulationLoading ? 'Running...' : 'Run Simulation'}
            </button>
          </div>
          <div className="card-body">
            {simulationLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status"></div>
                <p className="mt-2">Calculating production throughput...</p>
              </div>
            ) : simulationResults ? (
              <div className="row">
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-header">Production Rate</div>
                    <div className="card-body">
                      <h4>{simulationResults.parts_per_hour} parts/hour</h4>
                      <p className="mb-0">{simulationResults.parts_per_day} parts/day</p>
                      <p className="mb-0">{simulationResults.parts_per_week} parts/week</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-header">Cycle Information</div>
                    <div className="card-body">
                      <p className="mb-0"><strong>Cycle Time:</strong> {simulationResults.cycle_time} seconds</p>
                      <p className="mb-0"><strong>Process Time:</strong> {simulationResults.total_process_time || '-'} seconds</p>
                      <p className="mb-0"><strong>Drip Time:</strong> {simulationResults.total_drip_time || '-'} seconds</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-header">Resources</div>
                    <div className="card-body">
                      <p className="mb-0"><strong>Hoists Required:</strong> {simulationResults.hoist_count}</p>
                      <p className="mb-0"><strong>Utilization:</strong> {simulationResults.hoist_utilization}%</p>
                      <p className="mb-0">
                        <strong>Bottleneck:</strong> {simulationResults.bottleneck_station || 'None identified'}
                      </p>
                    </div>
                  </div>
                </div>
                {simulationResults.recommendations && (
                  <div className="col-12 mt-3">
                    <div className="alert alert-info">
                      <strong>Recommendations:</strong> {simulationResults.recommendations}
                    </div>
                  </div>
                )}
                <div className="col-12 mt-3 text-center">
                  <Link to={`/projects/${projectId}/simulation`} className="btn btn-primary">
                    View Detailed Simulation
                  </Link>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                Click "Run Simulation" to see production estimates.
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Form Card */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title">{editMode ? 'Edit Process Step' : 'Add Process Step'}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-2">
                <label htmlFor="station_number" className="form-label">Station #</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="station_number" 
                  name="station_number" 
                  value={formData.station_number} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="process_step" className="form-label">Process Step</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="process_step" 
                  name="process_step" 
                  value={formData.process_step} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
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
              <div className="col-md-2">
                <label htmlFor="dwell_time" className="form-label">Dwell Time (s)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="dwell_time" 
                  name="dwell_time" 
                  value={formData.dwell_time} 
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="drip_time" className="form-label">Drip Time (s)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="drip_time" 
                  name="drip_time" 
                  value={formData.drip_time} 
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3">
                <label htmlFor="min_dwell_time" className="form-label">Min Dwell Time (s)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="min_dwell_time" 
                  name="min_dwell_time" 
                  value={formData.min_dwell_time} 
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="max_dwell_time" className="form-label">Max Dwell Time (s)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="max_dwell_time" 
                  name="max_dwell_time" 
                  value={formData.max_dwell_time} 
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 d-flex align-items-end justify-content-end">
                {editMode && (
                  <button type="button" className="btn btn-secondary me-2" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  {editMode ? 'Update Step' : 'Add Step'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Process Map Table */}
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
                    <th>Dwell Time (s)</th>
                    <th>Drip Time (s)</th>
                    <th>Min Dwell (s)</th>
                    <th>Max Dwell (s)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processMapEntries.sort((a, b) => a.process_step - b.process_step).map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.station_number}</td>
                      <td>{entry.process_step}</td>
                      <td>{entry.process}</td>
                      <td>{entry.dwell_time || '-'}</td>
                      <td>{entry.drip_time || '-'}</td>
                      <td>{entry.min_dwell_time || '-'}</td>
                      <td>{entry.max_dwell_time || '-'}</td>
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