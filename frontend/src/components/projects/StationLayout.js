import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProjectById, fetchStations, createStation, updateStation, deleteStation, runQuickSimulation } from '../../api/apiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faIndustry } from '@fortawesome/free-solid-svg-icons';

const StationLayout = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Collapsible simulation panel
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    station_number: '',
    position_index: '',
    process_name: '',
    tank_length: '0',
    tank_width: '0',
    distance_to_next: '0',
    is_loading_station: false,
    is_unloading_station: false,
    notes: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [currentStationId, setCurrentStationId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);
        const stationData = await fetchStations(projectId);
        setStations(stationData);
      } catch (err) {
        setError('Error loading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const updated = await updateStation(projectId, { id: currentStationId, ...formData });
        setStations(stations.map(s => s.id === currentStationId ? updated : s));
        setEditMode(false);
        setCurrentStationId(null);
      } else {
        const newStation = await createStation(projectId, formData);
        setStations([...stations, newStation]);
      }
      resetForm();
      if (showSimulation) handleRunQuickSimulation();
    } catch (err) {
      setError('Error saving station. Please try again.');
    }
  };

  const handleEdit = (station) => {
    setFormData({
      station_number: station.station_number,
      position_index: station.position_index,
      process_name: station.process_name,
      tank_length: station.tank_length || '0',
      tank_width: station.tank_width || '0',
      distance_to_next: station.distance_to_next || '0',
      is_loading_station: station.is_loading_station,
      is_unloading_station: station.is_unloading_station,
      notes: station.notes || '',
    });
    setEditMode(true);
    setCurrentStationId(station.id);
  };

  const handleDelete = async (stationId) => {
    if (window.confirm('Are you sure you want to delete this station? Any recipe steps referencing it will also be deleted.')) {
      try {
        await deleteStation(projectId, stationId);
        setStations(stations.filter(s => s.id !== stationId));
        if (showSimulation) handleRunQuickSimulation();
      } catch (err) {
        setError('Error deleting station. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      station_number: '',
      position_index: '',
      process_name: '',
      tank_length: '0',
      tank_width: '0',
      distance_to_next: '0',
      is_loading_station: false,
      is_unloading_station: false,
      notes: '',
    });
    setEditMode(false);
    setCurrentStationId(null);
  };

  const handleRunQuickSimulation = async () => {
    if (stations.length === 0) {
      setError('Cannot run simulation without stations.');
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
      handleRunQuickSimulation();
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (!project) {
    return <div className="alert alert-warning">Project not found.</div>;
  }

  return (
    <div className="station-layout">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Station Layout - {project.project_name}</h1>
        <div>
          <button className="btn btn-info me-2" onClick={toggleSimulation}>
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

      {error && <div className="alert alert-danger alert-dismissible">
        {error}
        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
      </div>}

      {/* Collapsible Simulation Panel */}
      {showSimulation && (
        <div className="card mb-4">
          <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h3 className="card-title mb-0">Quick Production Simulation</h3>
            <button className="btn btn-outline-light btn-sm" onClick={handleRunQuickSimulation} disabled={simulationLoading}>
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
              simulationResults.error ? (
                <div className="alert alert-warning">{simulationResults.error}</div>
              ) : (
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
                        <p className="mb-0"><strong>Recipes:</strong> {simulationResults.recipe_count || 0}</p>
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
                        <p className="mb-0"><strong>Bottleneck:</strong> {simulationResults.bottleneck_station || 'None identified'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 mt-3 text-center">
                    <Link to={`/projects/${projectId}/simulation`} className="btn btn-primary">
                      View Detailed Simulation
                    </Link>
                  </div>
                </div>
              )
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
          <h3 className="card-title">{editMode ? 'Edit Station' : 'Add Station'}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-2">
                <label htmlFor="station_number" className="form-label">Station #</label>
                <input type="text" className="form-control" id="station_number" name="station_number"
                  value={formData.station_number} onChange={handleChange} required />
              </div>
              <div className="col-md-2">
                <label htmlFor="position_index" className="form-label">Position</label>
                <input type="number" className="form-control" id="position_index" name="position_index"
                  value={formData.position_index} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label htmlFor="process_name" className="form-label">Process Name</label>
                <input type="text" className="form-control" id="process_name" name="process_name"
                  value={formData.process_name} onChange={handleChange} required />
              </div>
              <div className="col-md-2">
                <label htmlFor="tank_length" className="form-label">Tank Length (m)</label>
                <input type="number" className="form-control" id="tank_length" name="tank_length"
                  value={formData.tank_length} onChange={handleChange} step="0.01" />
              </div>
              <div className="col-md-2">
                <label htmlFor="tank_width" className="form-label">Tank Width (m)</label>
                <input type="number" className="form-control" id="tank_width" name="tank_width"
                  value={formData.tank_width} onChange={handleChange} step="0.01" />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-2">
                <label htmlFor="distance_to_next" className="form-label">Dist to Next (m)</label>
                <input type="number" className="form-control" id="distance_to_next" name="distance_to_next"
                  value={formData.distance_to_next} onChange={handleChange} step="0.01" />
              </div>
              <div className="col-md-2">
                <div className="form-check mt-4">
                  <input type="checkbox" className="form-check-input" id="is_loading_station" name="is_loading_station"
                    checked={formData.is_loading_station} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="is_loading_station">Loading Station</label>
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-check mt-4">
                  <input type="checkbox" className="form-check-input" id="is_unloading_station" name="is_unloading_station"
                    checked={formData.is_unloading_station} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="is_unloading_station">Unloading Station</label>
                </div>
              </div>
              <div className="col-md-6 d-flex align-items-end justify-content-end">
                {editMode && (
                  <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>Cancel</button>
                )}
                <button type="submit" className="btn btn-primary">
                  {editMode ? 'Update Station' : 'Add Station'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Station Table */}
      <div className="card">
        <div className="card-header bg-success text-white">
          <h3 className="card-title">Stations ({stations.length})</h3>
        </div>
        <div className="card-body">
          {stations.length === 0 ? (
            <div className="alert alert-info">
              No stations have been added yet. Use the form above to add stations.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>Position</th>
                    <th>Station #</th>
                    <th>Process Name</th>
                    <th>Tank (L x W)</th>
                    <th>Dist to Next</th>
                    <th>Flags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.sort((a, b) => a.position_index - b.position_index).map((station) => (
                    <tr key={station.id}>
                      <td>{station.position_index}</td>
                      <td>{station.station_number}</td>
                      <td>{station.process_name}</td>
                      <td>{station.tank_length} x {station.tank_width}</td>
                      <td>{station.distance_to_next} m</td>
                      <td>
                        {station.is_loading_station && <span className="badge bg-success me-1">Load</span>}
                        {station.is_unloading_station && <span className="badge bg-warning me-1">Unload</span>}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(station)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(station.id)}>Delete</button>
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

export default StationLayout;
