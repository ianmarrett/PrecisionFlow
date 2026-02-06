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

// ---- Station API functions ----

export const fetchStations = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/stations/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stations for project ${projectId}:`, error);
    throw error;
  }
};

export const createStation = async (projectId, stationData) => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/stations/`, stationData);
    return response.data;
  } catch (error) {
    console.error('Error creating station:', error);
    throw error;
  }
};

export const updateStation = async (projectId, stationData) => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/stations/`, stationData);
    return response.data;
  } catch (error) {
    console.error('Error updating station:', error);
    throw error;
  }
};

export const deleteStation = async (projectId, stationId) => {
  try {
    const response = await apiClient.delete(`/projects/${projectId}/stations/`, {
      data: { id: stationId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting station:', error);
    throw error;
  }
};

// ---- Recipe API functions ----

export const fetchRecipes = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/recipes/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recipes for project ${projectId}:`, error);
    throw error;
  }
};

export const createRecipe = async (projectId, recipeData) => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/recipes/`, recipeData);
    return response.data;
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
};

export const fetchRecipe = async (projectId, recipeId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/recipes/${recipeId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recipe ${recipeId}:`, error);
    throw error;
  }
};

export const updateRecipe = async (projectId, recipeId, recipeData) => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/recipes/${recipeId}/`, recipeData);
    return response.data;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (projectId, recipeId) => {
  try {
    const response = await apiClient.delete(`/projects/${projectId}/recipes/${recipeId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// ---- Recipe Steps API functions ----

export const fetchRecipeSteps = async (projectId, recipeId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/recipes/${recipeId}/steps/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recipe steps:`, error);
    throw error;
  }
};

export const createRecipeStep = async (projectId, recipeId, stepData) => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/recipes/${recipeId}/steps/`, stepData);
    return response.data;
  } catch (error) {
    console.error('Error creating recipe step:', error);
    throw error;
  }
};

export const updateRecipeStep = async (projectId, recipeId, stepData) => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/recipes/${recipeId}/steps/`, stepData);
    return response.data;
  } catch (error) {
    console.error('Error updating recipe step:', error);
    throw error;
  }
};

export const deleteRecipeStep = async (projectId, recipeId, stepId) => {
  try {
    const response = await apiClient.delete(`/projects/${projectId}/recipes/${recipeId}/steps/`, {
      data: { id: stepId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting recipe step:', error);
    throw error;
  }
};