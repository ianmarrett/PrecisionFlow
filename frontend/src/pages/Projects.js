// src/pages/Projects.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import { fetchProjects } from '../api/apiService';
import ProjectList from '../components/projects/ProjectList';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading projects. Please try again later.');
        setLoading(false);
      }
    };

    getProjects();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="projects-page">
      <Header 
        title="Projects" 
        subtitle="Manage and track all your electroplating projects" 
      />
      
      <div className="d-flex justify-content-end mb-4">
        <Link to="/projects/new" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i> New Project
        </Link>
      </div>
      
      {projects.length === 0 ? (
        <div className="alert alert-info">
          No projects found. Click 'New Project' to create one.
        </div>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
};

export default Projects;