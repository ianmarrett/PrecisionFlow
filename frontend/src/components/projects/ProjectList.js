// src/components/projects/ProjectList.js
import React from 'react';
import { Link } from 'react-router-dom';

const ProjectList = ({ projects }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-primary">
          <tr>
            <th>Project ID</th>
            <th>Project Name</th>
            <th>Customer</th>
            <th>Process</th>
            <th>Equipment Type</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.project_id}</td>
              <td>{project.project_name}</td>
              <td>{project.customer_name}</td>
              <td>{project.process}</td>
              <td>{project.equipment_type}</td>
              <td>{new Date(project.last_updated).toLocaleDateString()}</td>
              <td>
                <Link to={`/projects/${project.project_id}`} className="btn btn-sm btn-info me-2">
                  View
                </Link>
                <Link to={`/projects/${project.project_id}/edit`} className="btn btn-sm btn-warning">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectList;