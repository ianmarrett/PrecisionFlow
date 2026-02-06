// src/components/projects/ProjectDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProjectById, uploadSpecDocument, uploadSketch } from '../../api/apiService';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({
    specDocument: { loading: false, error: null, success: false },
    sketch: { loading: false, error: null, success: false },
  });

  useEffect(() => {
    const getProjectDetails = async () => {
      try {
        const data = await fetchProjectById(projectId);
        setProject(data);
      } catch (err) {
        setError('Error loading project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getProjectDetails();
  }, [projectId]);

  const handleSpecUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus((prev) => ({
      ...prev,
      specDocument: { loading: true, error: null, success: false },
    }));

    try {
      await uploadSpecDocument(projectId, file);
      setUploadStatus((prev) => ({
        ...prev,
        specDocument: { loading: false, error: null, success: true },
      }));
      
      // Reload project data to show the updated document
      const updatedProject = await fetchProjectById(projectId);
      setProject(updatedProject);
    } catch (err) {
      setUploadStatus((prev) => ({
        ...prev,
        specDocument: { loading: false, error: 'Error uploading specification document.', success: false },
      }));
    }
  };

  const handleSketchUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus((prev) => ({
      ...prev,
      sketch: { loading: true, error: null, success: false },
    }));

    try {
      await uploadSketch(projectId, file);
      setUploadStatus((prev) => ({
        ...prev,
        sketch: { loading: false, error: null, success: true },
      }));
      
      // Reload project data to show the updated sketch
      const updatedProject = await fetchProjectById(projectId);
      setProject(updatedProject);
    } catch (err) {
      setUploadStatus((prev) => ({
        ...prev,
        sketch: { loading: false, error: 'Error uploading sketch.', success: false },
      }));
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
    <div className="project-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{project.project_name}</h1>
        <div>
          <Link to={`/projects/${projectId}/edit`} className="btn btn-warning me-2">
            Edit Project
          </Link>
          <Link to="/projects" className="btn btn-secondary">
            Back to Projects
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title">Project Information</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Project ID:</strong> {project.project_id}</p>
              <p><strong>Project Name:</strong> {project.project_name}</p>
              <p><strong>Customer:</strong> {project.customer_name}</p>
              <p><strong>Date Created:</strong> {new Date(project.date_created).toLocaleDateString()}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Equipment Type:</strong> {project.equipment_type}</p>
              <p><strong>Process:</strong> {project.process}</p>
              <p><strong>Substrate:</strong> {project.substrate}</p>
              <p><strong>Last Updated:</strong> {new Date(project.last_updated).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Document Upload Section */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h3 className="card-title">Specification Document</h3>
            </div>
            <div className="card-body">
              {project.spec_document ? (
                <div>
                  <p>Current document: {project.spec_document}</p>
                  <a href={project.spec_document} className="btn btn-sm btn-info" target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </div>
              ) : (
                <p>No specification document uploaded yet.</p>
              )}
              
              <hr />
              
              <div className="mt-3">
                <label htmlFor="specDocument" className="form-label">Upload New Document</label>
                <input
                  type="file"
                  className="form-control"
                  id="specDocument"
                  onChange={handleSpecUpload}
                  disabled={uploadStatus.specDocument.loading}
                />
                
                {uploadStatus.specDocument.loading && (
                  <div className="text-center mt-2">
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                    <span className="ms-2">Uploading...</span>
                  </div>
                )}
                
                {uploadStatus.specDocument.error && (
                  <div className="alert alert-danger mt-2">{uploadStatus.specDocument.error}</div>
                )}
                
                {uploadStatus.specDocument.success && (
                  <div className="alert alert-success mt-2">Document uploaded successfully!</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sketch Upload Section */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h3 className="card-title">Sales Sketch</h3>
            </div>
            <div className="card-body">
              {project.sketch ? (
                <div>
                  <p>Current sketch: {project.sketch}</p>
                  <a href={project.sketch} className="btn btn-sm btn-info" target="_blank" rel="noopener noreferrer">
                    View Sketch
                  </a>
                </div>
              ) : (
                <p>No sketch uploaded yet.</p>
              )}
              
              <hr />
              
              <div className="mt-3">
                <label htmlFor="sketchFile" className="form-label">Upload New Sketch</label>
                <input
                  type="file"
                  className="form-control"
                  id="sketchFile"
                  onChange={handleSketchUpload}
                  disabled={uploadStatus.sketch.loading}
                />
                
                {uploadStatus.sketch.loading && (
                  <div className="text-center mt-2">
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                    <span className="ms-2">Uploading...</span>
                  </div>
                )}
                
                {uploadStatus.sketch.error && (
                  <div className="alert alert-danger mt-2">{uploadStatus.sketch.error}</div>
                )}
                
                {uploadStatus.sketch.success && (
                  <div className="alert alert-success mt-2">Sketch uploaded successfully!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Project Workflow Links */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h3 className="card-title">Project Workflow</h3>
        </div>
        <div className="card-body">
          <div className="list-group">
            <Link to={`/projects/${projectId}/stations`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              Station Layout
              <span className="badge bg-primary rounded-pill">1</span>
            </Link>
            <Link to={`/projects/${projectId}/recipes`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              Plating Recipes
              <span className="badge bg-primary rounded-pill">2</span>
            </Link>
            <Link to={`/projects/${projectId}/process-matrix`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              Process Matrix
              <span className="badge bg-primary rounded-pill">3</span>
            </Link>
            <Link to={`/projects/${projectId}/controls-matrix`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              Controls Matrix
              <span className="badge bg-primary rounded-pill">4</span>
            </Link>
            <Link to={`/projects/${projectId}/budget`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              Budget
              <span className="badge bg-primary rounded-pill">5</span>
            </Link>
            <Link to={`/projects/${projectId}/quote`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              Final Quote
              <span className="badge bg-primary rounded-pill">6</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProjectDetail;