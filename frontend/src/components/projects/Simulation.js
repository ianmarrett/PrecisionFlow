// src/components/projects/Simulation.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProjectById, fetchProcessMap, getProductionGoal, updateProductionGoal, 
         getSimulationParameters, updateSimulationParameters, runSimulation, getSimulationResults } from '../../api/apiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faSave, faArrowLeft, faSync, faChartLine } from '@fortawesome/free-solid-svg-icons';

const Simulation = () => {
  const { projectId } = useParams();
  
  // Basic state
  const [project, setProject] = useState(null);
  const [processMapEntries, setProcessMapEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simulation state
  const [productionGoal, setProductionGoal] = useState({
    primary_target: 'day',
    target_parts_per_hour: 0,
    target_parts_per_day: 0,
    target_parts_per_week: 0,
    target_parts_per_month: 0,
    target_parts_per_year: 0
  });
  
  const [simulationParams, setSimulationParams] = useState({
    process_lines: 1,
    has_transfer_shuttle: false,
    calculated_hoist_count: 0,
    manual_hoist_count: null,
    hoist_speed_horizontal: 0.5,
    hoist_speed_vertical: 0.2,
    hoist_acceleration: 0.1,
    transfer_time: 10,
    parts_per_rack: 1,
    working_hours_per_day: 8,
    working_days_per_week: 5,
    part_load_time: 60,
    part_unload_time: 60,
    optimization_target: 'balanced'
  });
  
  const [simulationResults, setSimulationResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [simulationName, setSimulationName] = useState("Simulation Run");
  const [simLoading, setSimLoading] = useState(false);
  const [goalEdited, setGoalEdited] = useState(false);
  const [paramsEdited, setParamsEdited] = useState(false);
  
  // Load all required data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load project details
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);
        
        // Load process map entries
        const processMapData = await fetchProcessMap(projectId);
        setProcessMapEntries(processMapData);
        
        // Load production goals
        const goalData = await getProductionGoal(projectId);
        setProductionGoal(goalData);
        
        // Load simulation parameters
        const paramsData = await getSimulationParameters(projectId);
        setSimulationParams(paramsData);
        
        // Load simulation results
        const resultsData = await getSimulationResults(projectId);
        setSimulationResults(resultsData);
        if (resultsData.length > 0) {
          setSelectedResult(resultsData[0]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error loading simulation data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [projectId]);
  
  // Handle form changes for production goal
  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'primary_target') {
      setProductionGoal({
        ...productionGoal,
        primary_target: value
      });
    } else {
      setProductionGoal({
        ...productionGoal,
        [name]: parseFloat(value) || 0
      });
    }
    
    setGoalEdited(true);
  };
  
  // Handle form changes for simulation parameters
  const handleParamChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setSimulationParams({
        ...simulationParams,
        [name]: checked
      });
    } else if (name === 'optimization_target') {
      setSimulationParams({
        ...simulationParams,
        optimization_target: value
      });
    } else {
      // Handle numbers
      let parsedValue;
      if (value === '') {
        parsedValue = null; // Allow clearing the field
      } else {
        parsedValue = type === 'number' ? parseFloat(value) : value;
      }
      
      setSimulationParams({
        ...simulationParams,
        [name]: parsedValue
      });
    }
    
    setParamsEdited(true);
  };
  
  // Save production goal
  const saveProductionGoal = async () => {
    try {
      await updateProductionGoal(projectId, productionGoal);
      setGoalEdited(false);
    } catch (err) {
      setError('Error saving production goal. Please try again.');
    }
  };
  
  // Save simulation parameters
  const saveSimulationParams = async () => {
    try {
      const updatedParams = await updateSimulationParameters(projectId, simulationParams);
      setSimulationParams(updatedParams);
      setParamsEdited(false);
    } catch (err) {
      setError('Error saving simulation parameters. Please try again.');
    }
  };
  
  // Run a new simulation
  const handleRunSimulation = async () => {
    if (processMapEntries.length === 0) {
      setError('Cannot run simulation without process map entries.');
      return;
    }
    
    // Save any unsaved changes first
    if (goalEdited) {
      await saveProductionGoal();
    }
    
    if (paramsEdited) {
      await saveSimulationParams();
    }
    
    setSimLoading(true);
    try {
      const result = await runSimulation(projectId, { name: simulationName });
      setSimulationResults([result, ...simulationResults]);
      setSelectedResult(result);
      setError(null);
    } catch (err) {
      setError('Error running simulation. Please try again later.');
    } finally {
      setSimLoading(false);
    }
  };
  
  // Select a result to view
  const selectResult = (result) => {
    setSelectedResult(result);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
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
  
  // Prepare data for charts
  const simulationComparisonData = simulationResults.slice(0, 5).map(result => ({
    name: result.name,
    partsPerHour: result.parts_per_hour,
    partsPerDay: result.parts_per_day,
    hoistCount: result.hoist_count,
    cycleTime: result.cycle_time,
  }));
  
  return (
    <div className="simulation-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Production Simulation - {project.project_name}</h1>
        <div>
          <Link to={`/projects/${projectId}/process-map`} className="btn btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
            Back to Process Map
          </Link>
        </div>
      </div>
      
      <div className="row">
        {/* Left Column - Parameters */}
        <div className="col-md-4">
          {/* Production Goal Card */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Production Goal</h3>
              <button 
                className="btn btn-outline-light btn-sm" 
                onClick={saveProductionGoal}
                disabled={!goalEdited}
              >
                <FontAwesomeIcon icon={faSave} className="me-1" />
                Save
              </button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="primary_target" className="form-label">Primary Target</label>
                <select
                  className="form-select"
                  id="primary_target"
                  name="primary_target"
                  value={productionGoal.primary_target}
                  onChange={handleGoalChange}
                >
                  <option value="hour">Parts Per Hour</option>
                  <option value="day">Parts Per Day</option>
                  <option value="week">Parts Per Week</option>
                  <option value="month">Parts Per Month</option>
                  <option value="year">Parts Per Year</option>
                </select>
              </div>
              
              {productionGoal.primary_target === 'hour' && (
                <div className="mb-3">
                  <label htmlFor="target_parts_per_hour" className="form-label">Target Parts Per Hour</label>
                  <input
                    type="number"
                    className="form-control"
                    id="target_parts_per_hour"
                    name="target_parts_per_hour"
                    value={productionGoal.target_parts_per_hour}
                    onChange={handleGoalChange}
                  />
                </div>
              )}
              
              {productionGoal.primary_target === 'day' && (
                <div className="mb-3">
                  <label htmlFor="target_parts_per_day" className="form-label">Target Parts Per Day</label>
                  <input
                    type="number"
                    className="form-control"
                    id="target_parts_per_day"
                    name="target_parts_per_day"
                    value={productionGoal.target_parts_per_day}
                    onChange={handleGoalChange}
                  />
                </div>
              )}
              
              {productionGoal.primary_target === 'week' && (
                <div className="mb-3">
                  <label htmlFor="target_parts_per_week" className="form-label">Target Parts Per Week</label>
                  <input
                    type="number"
                    className="form-control"
                    id="target_parts_per_week"
                    name="target_parts_per_week"
                    value={productionGoal.target_parts_per_week}
                    onChange={handleGoalChange}
                  />
                </div>
              )}
              
              {productionGoal.primary_target === 'month' && (
                <div className="mb-3">
                  <label htmlFor="target_parts_per_month" className="form-label">Target Parts Per Month</label>
                  <input
                    type="number"
                    className="form-control"
                    id="target_parts_per_month"
                    name="target_parts_per_month"
                    value={productionGoal.target_parts_per_month}
                    onChange={handleGoalChange}
                  />
                </div>
              )}
              
              {productionGoal.primary_target === 'year' && (
                <div className="mb-3">
                  <label htmlFor="target_parts_per_year" className="form-label">Target Parts Per Year</label>
                  <input
                    type="number"
                    className="form-control"
                    id="target_parts_per_year"
                    name="target_parts_per_year"
                    value={productionGoal.target_parts_per_year}
                    onChange={handleGoalChange}
                  />
                </div>
              )}
              
              <div className="alert alert-info mt-3">
                <small className="d-block mb-2">Calculated Values:</small>
                <div className="row">
                  <div className="col-6">
                    <small className="d-block"><strong>Per Hour:</strong> {(productionGoal.target_parts_per_hour || 0).toFixed(2)}</small>
                    <small className="d-block"><strong>Per Day:</strong> {(productionGoal.target_parts_per_day || 0).toFixed(2)}</small>
                    <small className="d-block"><strong>Per Week:</strong> {(productionGoal.target_parts_per_week || 0).toFixed(2)}</small>
                  </div>
                  <div className="col-6">
                    <small className="d-block"><strong>Per Month:</strong> {(productionGoal.target_parts_per_month || 0).toFixed(2)}</small>
                    <small className="d-block"><strong>Per Year:</strong> {(productionGoal.target_parts_per_year || 0).toFixed(2)}</small>
                  </div>
                  </div>
              </div>
            </div>
          </div>
          
          {/* Simulation Parameters Card */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Simulation Parameters</h3>
              <button 
                className="btn btn-outline-light btn-sm" 
                onClick={saveSimulationParams}
                disabled={!paramsEdited}
              >
                <FontAwesomeIcon icon={faSave} className="me-1" />
                Save
              </button>
            </div>
            <div className="card-body">
              <h5 className="card-subtitle mb-3">Line Configuration</h5>
              <div className="mb-3">
                <label htmlFor="process_lines" className="form-label">Process Lines</label>
                <input
                  type="number"
                  className="form-control"
                  id="process_lines"
                  name="process_lines"
                  value={simulationParams.process_lines}
                  onChange={handleParamChange}
                  min="1"
                />
              </div>
              
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="has_transfer_shuttle"
                  name="has_transfer_shuttle"
                  checked={simulationParams.has_transfer_shuttle}
                  onChange={handleParamChange}
                />
                <label className="form-check-label" htmlFor="has_transfer_shuttle">
                  Has Transfer Shuttle
                </label>
              </div>
              
              <h5 className="card-subtitle mb-3 mt-4">Hoist Configuration</h5>
              <div className="mb-3">
                <label htmlFor="calculated_hoist_count" className="form-label">Calculated Hoists Needed</label>
                <input
                  type="number"
                  className="form-control"
                  id="calculated_hoist_count"
                  value={simulationParams.calculated_hoist_count}
                  disabled
                />
                <small className="form-text text-muted">Based on production goal</small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="manual_hoist_count" className="form-label">Manual Hoist Count (Optional)</label>
                <input
                  type="number"
                  className="form-control"
                  id="manual_hoist_count"
                  name="manual_hoist_count"
                  value={simulationParams.manual_hoist_count || ''}
                  onChange={handleParamChange}
                  placeholder="Leave blank to use calculated count"
                  min="1"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="hoist_speed_horizontal" className="form-label">Hoist Horizontal Speed (m/s)</label>
                <input
                  type="number"
                  className="form-control"
                  id="hoist_speed_horizontal"
                  name="hoist_speed_horizontal"
                  value={simulationParams.hoist_speed_horizontal}
                  onChange={handleParamChange}
                  step="0.1"
                  min="0.1"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="hoist_speed_vertical" className="form-label">Hoist Vertical Speed (m/s)</label>
                <input
                  type="number"
                  className="form-control"
                  id="hoist_speed_vertical"
                  name="hoist_speed_vertical"
                  value={simulationParams.hoist_speed_vertical}
                  onChange={handleParamChange}
                  step="0.1"
                  min="0.1"
                />
              </div>
              
              <h5 className="card-subtitle mb-3 mt-4">Time Parameters</h5>
              <div className="mb-3">
                <label htmlFor="transfer_time" className="form-label">Transfer Time (seconds)</label>
                <input
                  type="number"
                  className="form-control"
                  id="transfer_time"
                  name="transfer_time"
                  value={simulationParams.transfer_time}
                  onChange={handleParamChange}
                  min="0"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="part_load_time" className="form-label">Part Load Time (seconds)</label>
                <input
                  type="number"
                  className="form-control"
                  id="part_load_time"
                  name="part_load_time"
                  value={simulationParams.part_load_time}
                  onChange={handleParamChange}
                  min="0"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="part_unload_time" className="form-label">Part Unload Time (seconds)</label>
                <input
                  type="number"
                  className="form-control"
                  id="part_unload_time"
                  name="part_unload_time"
                  value={simulationParams.part_unload_time}
                  onChange={handleParamChange}
                  min="0"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="parts_per_rack" className="form-label">Parts Per Rack</label>
                <input
                  type="number"
                  className="form-control"
                  id="parts_per_rack"
                  name="parts_per_rack"
                  value={simulationParams.parts_per_rack}
                  onChange={handleParamChange}
                  min="1"
                />
              </div>
              
              <h5 className="card-subtitle mb-3 mt-4">Schedule</h5>
              <div className="mb-3">
                <label htmlFor="working_hours_per_day" className="form-label">Working Hours Per Day</label>
                <input
                  type="number"
                  className="form-control"
                  id="working_hours_per_day"
                  name="working_hours_per_day"
                  value={simulationParams.working_hours_per_day}
                  onChange={handleParamChange}
                  step="0.5"
                  min="1"
                  max="24"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="working_days_per_week" className="form-label">Working Days Per Week</label>
                <input
                  type="number"
                  className="form-control"
                  id="working_days_per_week"
                  name="working_days_per_week"
                  value={simulationParams.working_days_per_week}
                  onChange={handleParamChange}
                  min="1"
                  max="7"
                />
              </div>
              
              <h5 className="card-subtitle mb-3 mt-4">Optimization</h5>
              <div className="mb-3">
                <label htmlFor="optimization_target" className="form-label">Optimization Target</label>
                <select
                  className="form-select"
                  id="optimization_target"
                  name="optimization_target"
                  value={simulationParams.optimization_target}
                  onChange={handleParamChange}
                >
                  <option value="throughput">Maximum Throughput</option>
                  <option value="hoists">Minimum Hoists</option>
                  <option value="balanced">Balanced Operation</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Run Simulation Card */}
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h3 className="card-title mb-0">Run Simulation</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="simulationName" className="form-label">Simulation Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="simulationName"
                  value={simulationName}
                  onChange={(e) => setSimulationName(e.target.value)}
                />
              </div>
              
              <button 
                className="btn btn-success w-100" 
                onClick={handleRunSimulation}
                disabled={simLoading || processMapEntries.length === 0}
              >
                {simLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlay} className="me-1" />
                    Run Simulation
                  </>
                )}
              </button>
              
              {processMapEntries.length === 0 && (
                <div className="alert alert-warning mt-3">
                  <small>You need to add process steps in the Process Map before running a simulation.</small>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Results */}
        <div className="col-md-8">
          {/* Simulation Results Card */}
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h3 className="card-title mb-0">Simulation Results</h3>
            </div>
            <div className="card-body">
              {simulationResults.length === 0 ? (
                <div className="alert alert-info">
                  No simulations have been run yet. Set your parameters and click "Run Simulation".
                </div>
              ) : (
                <>
                  {/* Tabs for different simulation runs */}
                  <ul className="nav nav-tabs mb-3">
                    {simulationResults.slice(0, 5).map((result, index) => (
                      <li className="nav-item" key={index}>
                        <button 
                          className={`nav-link ${selectedResult && selectedResult.id === result.id ? 'active' : ''}`}
                          onClick={() => selectResult(result)}
                        >
                          {result.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                  
                  {selectedResult && (
                    <div className="simulation-details">
                      <div className="card mb-3">
                        <div className="card-header bg-light">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{selectedResult.name}</h5>
                            <small className="text-muted">Run on {formatDate(selectedResult.simulation_date)}</small>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <h5>Production Throughput</h5>
                              <table className="table table-sm">
                                <tbody>
                                  <tr>
                                    <th>Parts Per Hour</th>
                                    <td>{selectedResult.parts_per_hour}</td>
                                  </tr>
                                  <tr>
                                    <th>Parts Per Day</th>
                                    <td>{selectedResult.parts_per_day}</td>
                                  </tr>
                                  <tr>
                                    <th>Parts Per Week</th>
                                    <td>{selectedResult.parts_per_week}</td>
                                  </tr>
                                  <tr>
                                    <th>Parts Per Month</th>
                                    <td>{selectedResult.parts_per_month}</td>
                                  </tr>
                                  <tr>
                                    <th>Parts Per Year</th>
                                    <td>{selectedResult.parts_per_year}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            
                            <div className="col-md-6">
                              <h5>Cycle Details</h5>
                              <table className="table table-sm">
                                <tbody>
                                  <tr>
                                    <th>Cycle Time</th>
                                    <td>{selectedResult.cycle_time} seconds</td>
                                  </tr>
                                  <tr>
                                    <th>Process Time</th>
                                    <td>{selectedResult.total_process_time} seconds</td>
                                  </tr>
                                  <tr>
                                    <th>Transfer Time</th>
                                    <td>{selectedResult.total_transfer_time} seconds</td>
                                  </tr>
                                  <tr>
                                    <th>Drip Time</th>
                                    <td>{selectedResult.total_drip_time} seconds</td>
                                  </tr>
                                  <tr>
                                    <th>Hoists Required</th>
                                    <td>{selectedResult.hoist_count}</td>
                                  </tr>
                                  <tr>
                                    <th>Hoist Utilization</th>
                                    <td>{selectedResult.hoist_utilization}%</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                          
                          {selectedResult.bottleneck_description && (
                            <div className="alert alert-warning mt-3">
                              <strong>Bottleneck: </strong> {selectedResult.bottleneck_description}
                            </div>
                          )}
                          
                          {selectedResult.recommendations && (
                            <div className="alert alert-info mt-3">
                              <strong>Recommendations: </strong> {selectedResult.recommendations}
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <div className="d-flex align-items-center mb-2">
                              <h5 className="mb-0 me-2">Goal Achievement</h5>
                              <span className={`badge ${selectedResult.meets_production_goal ? 'bg-success' : 'bg-danger'}`}>
                                {selectedResult.meets_production_goal ? 'Meets Goal' : 'Below Goal'}
                              </span>
                            </div>
                            
                            <div className="progress" style={{ height: '24px' }}>
                              <div 
                                className={`progress-bar ${selectedResult.meets_production_goal ? 'bg-success' : 'bg-warning'}`}
                                role="progressbar" 
                                style={{ 
                                  width: `${Math.min(100, (selectedResult.parts_per_hour / productionGoal.target_parts_per_hour) * 100)}%` 
                                }}
                                aria-valuenow={selectedResult.parts_per_hour} 
                                aria-valuemin="0" 
                                aria-valuemax={productionGoal.target_parts_per_hour}
                              >
                                {((selectedResult.parts_per_hour / productionGoal.target_parts_per_hour) * 100).toFixed(1)}%
                              </div>
                            </div>
                            <small className="text-muted">
                              {selectedResult.parts_per_hour} parts/hour vs. goal of {productionGoal.target_parts_per_hour} parts/hour
                            </small>
                          </div>
                        </div>
                      </div>
                      
                      {/* Charts */}
                      <div className="card">
                        <div className="card-header bg-light">
                          <h5 className="mb-0">
                            <FontAwesomeIcon icon={faChartLine} className="me-2" />
                            Simulation Comparison
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            {/* Production Rate Chart */}
                            <div className="col-md-6 mb-4">
                              <h6 className="text-center">Production Rate</h6>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart 
                                  data={simulationComparisonData} 
                                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="partsPerHour" fill="#8884d8" name="Parts Per Hour" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            
                            {/* Hoist and Cycle Time Chart */}
                            <div className="col-md-6 mb-4">
                              <h6 className="text-center">Hoists vs. Cycle Time</h6>
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart 
                                  data={simulationComparisonData}
                                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis yAxisId="left" />
                                  <YAxis yAxisId="right" orientation="right" />
                                  <Tooltip />
                                  <Legend />
                                  <Line yAxisId="left" type="monotone" dataKey="hoistCount" stroke="#8884d8" name="Hoists" />
                                  <Line yAxisId="right" type="monotone" dataKey="cycleTime" stroke="#82ca9d" name="Cycle Time (s)" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;