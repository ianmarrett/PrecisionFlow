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

// src/api/apiService.js (additional functions)

// Process Map API functions
export const fetchProcessMap = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/process-map/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching process map for project ${projectId}:`, error);
    throw error;
  }
};

export const createProcessMapEntry = async (projectId, entryData) => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/process-map/`, entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating process map entry:', error);
    throw error;
  }
};

export const updateProcessMapEntry = async (projectId, entryData) => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/process-map/`, entryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating process map entry:`, error);
    throw error;
  }
};

export const deleteProcessMapEntry = async (projectId, entryId) => {
  try {
    const response = await apiClient.delete(`/projects/${projectId}/process-map/`, {
      data: { id: entryId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting process map entry:`, error);
    throw error;
  }
};

// Production Goals API functions
export const getProductionGoal = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/production-goal/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching production goal for project ${projectId}:`, error);
    throw error;
  }
};

export const updateProductionGoal = async (projectId, goalData) => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/production-goal/`, goalData);
    return response.data;
  } catch (error) {
    console.error(`Error updating production goal:`, error);
    throw error;
  }
};

// Simulation Parameters API functions
export const getSimulationParameters = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/simulation/parameters/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching simulation parameters for project ${projectId}:`, error);
    throw error;
  }
};

export const updateSimulationParameters = async (projectId, paramsData) => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/simulation/parameters/`, paramsData);
    return response.data;
  } catch (error) {
    console.error(`Error updating simulation parameters:`, error);
    throw error;
  }
};

// Simulation API functions
export const runQuickSimulation = async (projectId, hoistCount) => {
  try {
    let url = `/projects/${projectId}/simulation/quick/`;
    if (hoistCount) {
      url += `?hoists=${hoistCount}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error running quick simulation:`, error);
    throw error;
  }
};

export const runSimulation = async (projectId, options = {}) => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/simulation/run/`, options);
    return response.data;
  } catch (error) {
    console.error(`Error running simulation:`, error);
    throw error;
  }
};

export const getSimulationResults = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/simulation/run/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching simulation results:`, error);
    throw error;
  }
};