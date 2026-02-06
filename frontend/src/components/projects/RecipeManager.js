import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProjectById, fetchStations, fetchRecipes, createRecipe, fetchRecipe, updateRecipe, deleteRecipe,
         fetchRecipeSteps, createRecipeStep, updateRecipeStep, deleteRecipeStep } from '../../api/apiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const RecipeManager = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [stations, setStations] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recipe form
  const [recipeForm, setRecipeForm] = useState({ name: '', description: '', production_ratio: 1 });
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  // Expanded recipe (showing steps)
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [recipeSteps, setRecipeSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);

  // Step form
  const [stepForm, setStepForm] = useState({ station: '', step_order: '', dwell_time: '', min_dwell_time: '', max_dwell_time: '', drip_time: '0', notes: '' });
  const [editingStepId, setEditingStepId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectData, stationData, recipeData] = await Promise.all([
          fetchProjectById(projectId),
          fetchStations(projectId),
          fetchRecipes(projectId),
        ]);
        setProject(projectData);
        setStations(stationData);
        setRecipes(recipeData);
      } catch (err) {
        setError('Error loading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  // ---- Recipe CRUD ----

  const handleRecipeChange = (e) => {
    const { name, value } = e.target;
    setRecipeForm({ ...recipeForm, [name]: value });
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecipeId) {
        const updated = await updateRecipe(projectId, editingRecipeId, recipeForm);
        setRecipes(recipes.map(r => r.id === editingRecipeId ? { ...r, ...updated } : r));
        setEditingRecipeId(null);
      } else {
        const newRecipe = await createRecipe(projectId, recipeForm);
        setRecipes([...recipes, newRecipe]);
      }
      setRecipeForm({ name: '', description: '', production_ratio: 1 });
    } catch (err) {
      setError('Error saving recipe. Please try again.');
    }
  };

  const handleEditRecipe = (recipe) => {
    setRecipeForm({ name: recipe.name, description: recipe.description || '', production_ratio: recipe.production_ratio });
    setEditingRecipeId(recipe.id);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Delete this recipe and all its steps?')) {
      try {
        await deleteRecipe(projectId, recipeId);
        setRecipes(recipes.filter(r => r.id !== recipeId));
        if (expandedRecipeId === recipeId) {
          setExpandedRecipeId(null);
          setRecipeSteps([]);
        }
      } catch (err) {
        setError('Error deleting recipe. Please try again.');
      }
    }
  };

  const handleToggleActive = async (recipe) => {
    try {
      const updated = await updateRecipe(projectId, recipe.id, { is_active: !recipe.is_active });
      setRecipes(recipes.map(r => r.id === recipe.id ? { ...r, ...updated } : r));
    } catch (err) {
      setError('Error toggling recipe active state.');
    }
  };

  const cancelRecipeEdit = () => {
    setRecipeForm({ name: '', description: '', production_ratio: 1 });
    setEditingRecipeId(null);
  };

  // ---- Expand recipe to show steps ----

  const toggleExpandRecipe = async (recipeId) => {
    if (expandedRecipeId === recipeId) {
      setExpandedRecipeId(null);
      setRecipeSteps([]);
      return;
    }
    setExpandedRecipeId(recipeId);
    setStepsLoading(true);
    try {
      const steps = await fetchRecipeSteps(projectId, recipeId);
      setRecipeSteps(steps);
    } catch (err) {
      setError('Error loading recipe steps.');
    } finally {
      setStepsLoading(false);
    }
  };

  // ---- Step CRUD ----

  const handleStepChange = (e) => {
    const { name, value } = e.target;
    setStepForm({ ...stepForm, [name]: value });
  };

  const handleStepSubmit = async (e) => {
    e.preventDefault();
    if (!expandedRecipeId) return;
    try {
      if (editingStepId) {
        const updated = await updateRecipeStep(projectId, expandedRecipeId, { id: editingStepId, ...stepForm });
        setRecipeSteps(recipeSteps.map(s => s.id === editingStepId ? updated : s));
        setEditingStepId(null);
      } else {
        const newStep = await createRecipeStep(projectId, expandedRecipeId, stepForm);
        setRecipeSteps([...recipeSteps, newStep]);
        // Update step count in recipe list
        setRecipes(recipes.map(r => r.id === expandedRecipeId ? { ...r, step_count: (r.step_count || 0) + 1 } : r));
      }
      setStepForm({ station: '', step_order: '', dwell_time: '', min_dwell_time: '', max_dwell_time: '', drip_time: '0', notes: '' });
    } catch (err) {
      setError('Error saving recipe step. Please try again.');
    }
  };

  const handleEditStep = (step) => {
    setStepForm({
      station: step.station,
      step_order: step.step_order,
      dwell_time: step.dwell_time || '',
      min_dwell_time: step.min_dwell_time || '',
      max_dwell_time: step.max_dwell_time || '',
      drip_time: step.drip_time || '0',
      notes: step.notes || '',
    });
    setEditingStepId(step.id);
  };

  const handleDeleteStep = async (stepId) => {
    if (window.confirm('Delete this step?')) {
      try {
        await deleteRecipeStep(projectId, expandedRecipeId, stepId);
        setRecipeSteps(recipeSteps.filter(s => s.id !== stepId));
        setRecipes(recipes.map(r => r.id === expandedRecipeId ? { ...r, step_count: Math.max(0, (r.step_count || 1) - 1) } : r));
      } catch (err) {
        setError('Error deleting step. Please try again.');
      }
    }
  };

  const cancelStepEdit = () => {
    setStepForm({ station: '', step_order: '', dwell_time: '', min_dwell_time: '', max_dwell_time: '', drip_time: '0', notes: '' });
    setEditingStepId(null);
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (!project) {
    return <div className="alert alert-warning">Project not found.</div>;
  }

  // Compute ratio display string
  const ratioString = recipes.filter(r => r.is_active).map(r => r.production_ratio).join(':') || '-';

  return (
    <div className="recipe-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Plating Recipes - {project.project_name}</h1>
        <div>
          <Link to={`/projects/${projectId}/stations`} className="btn btn-outline-primary me-2">Station Layout</Link>
          <Link to={`/projects/${projectId}/simulation`} className="btn btn-success me-2">Full Simulation</Link>
          <Link to={`/projects/${projectId}`} className="btn btn-secondary">Back to Project</Link>
        </div>
      </div>

      {error && <div className="alert alert-danger alert-dismissible">
        {error}
        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
      </div>}

      {stations.length === 0 && (
        <div className="alert alert-warning">
          No stations defined yet. <Link to={`/projects/${projectId}/stations`}>Add stations first</Link> before creating recipes.
        </div>
      )}

      {/* Recipe Form */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title mb-0">{editingRecipeId ? 'Edit Recipe' : 'Add Recipe'}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleRecipeSubmit}>
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="name" className="form-label">Recipe Name</label>
                <input type="text" className="form-control" id="name" name="name"
                  value={recipeForm.name} onChange={handleRecipeChange} required />
              </div>
              <div className="col-md-4">
                <label htmlFor="description" className="form-label">Description</label>
                <input type="text" className="form-control" id="description" name="description"
                  value={recipeForm.description} onChange={handleRecipeChange} />
              </div>
              <div className="col-md-2">
                <label htmlFor="production_ratio" className="form-label">Production Ratio</label>
                <input type="number" className="form-control" id="production_ratio" name="production_ratio"
                  value={recipeForm.production_ratio} onChange={handleRecipeChange} min="1" required />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                {editingRecipeId && (
                  <button type="button" className="btn btn-secondary me-2" onClick={cancelRecipeEdit}>Cancel</button>
                )}
                <button type="submit" className="btn btn-primary">
                  {editingRecipeId ? 'Update' : 'Add Recipe'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Recipe List */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">Recipes ({recipes.length})</h3>
          <span className="badge bg-light text-dark">Ratio: {ratioString}</span>
        </div>
        <div className="card-body">
          {recipes.length === 0 ? (
            <div className="alert alert-info">No recipes yet. Add one above.</div>
          ) : (
            <div className="list-group">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => toggleExpandRecipe(recipe.id)}>
                        <FontAwesomeIcon icon={expandedRecipeId === recipe.id ? faChevronUp : faChevronDown} />
                      </button>
                      <div>
                        <strong>{recipe.name}</strong>
                        {recipe.description && <small className="text-muted ms-2">- {recipe.description}</small>}
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-primary me-2">Ratio: {recipe.production_ratio}</span>
                      <span className="badge bg-secondary me-2">{recipe.step_count || 0} steps</span>
                      <div className="form-check form-switch me-2">
                        <input className="form-check-input" type="checkbox" checked={recipe.is_active}
                          onChange={() => handleToggleActive(recipe)} />
                        <label className="form-check-label"><small>{recipe.is_active ? 'Active' : 'Inactive'}</small></label>
                      </div>
                      <button className="btn btn-sm btn-warning me-1" onClick={() => handleEditRecipe(recipe)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRecipe(recipe.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Steps Section */}
                  {expandedRecipeId === recipe.id && (
                    <div className="mt-3 border-top pt-3">
                      {stepsLoading ? (
                        <div className="text-center"><div className="spinner-border spinner-border-sm" role="status"></div></div>
                      ) : (
                        <>
                          {/* Step Form */}
                          <form onSubmit={handleStepSubmit} className="mb-3">
                            <div className="row g-2 align-items-end">
                              <div className="col-md-2">
                                <label className="form-label"><small>Station</small></label>
                                <select className="form-select form-select-sm" name="station" value={stepForm.station} onChange={handleStepChange} required>
                                  <option value="">Select...</option>
                                  {stations.sort((a, b) => a.position_index - b.position_index).map(s => (
                                    <option key={s.id} value={s.id}>{s.station_number} - {s.process_name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-1">
                                <label className="form-label"><small>Order</small></label>
                                <input type="number" className="form-control form-control-sm" name="step_order"
                                  value={stepForm.step_order} onChange={handleStepChange} required />
                              </div>
                              <div className="col-md-2">
                                <label className="form-label"><small>Dwell (s)</small></label>
                                <input type="number" className="form-control form-control-sm" name="dwell_time"
                                  value={stepForm.dwell_time} onChange={handleStepChange} />
                              </div>
                              <div className="col-md-1">
                                <label className="form-label"><small>Min</small></label>
                                <input type="number" className="form-control form-control-sm" name="min_dwell_time"
                                  value={stepForm.min_dwell_time} onChange={handleStepChange} />
                              </div>
                              <div className="col-md-1">
                                <label className="form-label"><small>Max</small></label>
                                <input type="number" className="form-control form-control-sm" name="max_dwell_time"
                                  value={stepForm.max_dwell_time} onChange={handleStepChange} />
                              </div>
                              <div className="col-md-1">
                                <label className="form-label"><small>Drip (s)</small></label>
                                <input type="number" className="form-control form-control-sm" name="drip_time"
                                  value={stepForm.drip_time} onChange={handleStepChange} />
                              </div>
                              <div className="col-md-2">
                                {editingStepId && (
                                  <button type="button" className="btn btn-secondary btn-sm me-1" onClick={cancelStepEdit}>Cancel</button>
                                )}
                                <button type="submit" className="btn btn-primary btn-sm">
                                  <FontAwesomeIcon icon={faPlus} className="me-1" />
                                  {editingStepId ? 'Update' : 'Add Step'}
                                </button>
                              </div>
                            </div>
                          </form>

                          {/* Steps Table */}
                          {recipeSteps.length === 0 ? (
                            <div className="alert alert-info alert-sm"><small>No steps yet. Add steps using the form above.</small></div>
                          ) : (
                            <table className="table table-sm table-bordered">
                              <thead className="table-light">
                                <tr>
                                  <th>Order</th>
                                  <th>Station</th>
                                  <th>Process</th>
                                  <th>Dwell (s)</th>
                                  <th>Min</th>
                                  <th>Max</th>
                                  <th>Drip (s)</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recipeSteps.sort((a, b) => a.step_order - b.step_order).map(step => (
                                  <tr key={step.id}>
                                    <td>{step.step_order}</td>
                                    <td>{step.station_number || step.station}</td>
                                    <td>{step.station_process_name || '-'}</td>
                                    <td>{step.dwell_time || '-'}</td>
                                    <td>{step.min_dwell_time || '-'}</td>
                                    <td>{step.max_dwell_time || '-'}</td>
                                    <td>{step.drip_time || '-'}</td>
                                    <td>
                                      <button className="btn btn-sm btn-warning me-1" onClick={() => handleEditStep(step)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                      </button>
                                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteStep(step.id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeManager;
