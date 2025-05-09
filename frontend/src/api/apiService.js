// src/api/apiService.js
import axios from 'axios';

// Base URL for API requests
const API_URL = 'http://localhost:8000/api';

// Create axios instance for consistent headers
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Project API functions
export const fetchProjects = async () => {
  try {
    const response = await apiClient.get('/projects/');
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const fetchProjectById = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await apiClient.post('/projects/create/', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/edit/`, projectData);
    return response.data;
  } catch (error) {
    console.error(`Error updating project ${projectId}:`, error);
    throw error;
  }
};

// Customer API functions
export const fetchCustomers = async () => {
  try {
    const response = await apiClient.get('/customers/');
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const fetchCustomerById = async (customerId) => {
  try {
    const response = await apiClient.get(`/customers/${customerId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await apiClient.post('/customers/create/', customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// File upload functions
export const uploadSpecDocument = async (projectId, file) => {
  const formData = new FormData();
  formData.append('spec_document', file);
  
  try {
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/upload-spec/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading spec document:', error);
    throw error;
  }
};

export const uploadSketch = async (projectId, file) => {
  const formData = new FormData();
  formData.append('sketch', file);
  
  try {
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/upload-sketch/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading sketch:', error);
    throw error;
  }
};