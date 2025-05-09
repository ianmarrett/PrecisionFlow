from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Projects, Customers, EquipmentTypeChoices
from .serializers import ProjectsSerializer, CustomersSerializer
import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# API endpoints for Projects
@api_view(['GET'])
def project_list(request):
    """
    List all projects
    """
    projects = Projects.objects.all()
    # Add customer name to each project for display
    projects_data = []
    for project in projects:
        project_data = ProjectsSerializer(project).data
        project_data['customer_name'] = project.customer.company_name
        projects_data.append(project_data)
    return Response(projects_data)

@api_view(['POST'])
def project_create(request):
    """
    Create a new project
    """
    serializer = ProjectsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def project_detail(request, project_id):
    """
    Retrieve a project by ID
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # Add customer name to project data
    project_data = ProjectsSerializer(project).data
    project_data['customer_name'] = project.customer.company_name
    
    return Response(project_data)

@api_view(['PUT'])
def project_edit(request, project_id):
    """
    Update a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProjectsSerializer(project, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def project_delete(request, project_id):
    """
    Delete a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    project.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# API endpoints for Customers
@api_view(['GET'])
def customer_list(request):
    """
    List all customers
    """
    customers = Customers.objects.all()
    serializer = CustomersSerializer(customers, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def customer_create(request):
    """
    Create a new customer
    """
    serializer = CustomersSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def customer_detail(request, customer_id):
    """
    Retrieve a customer by ID
    """
    try:
        customer = Customers.objects.get(id=customer_id)
    except Customers.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = CustomersSerializer(customer)
    return Response(serializer.data)

@api_view(['PUT'])
def customer_edit(request, customer_id):
    """
    Update a customer
    """
    try:
        customer = Customers.objects.get(id=customer_id)
    except Customers.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = CustomersSerializer(customer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def customer_delete(request, customer_id):
    """
    Delete a customer
    """
    try:
        customer = Customers.objects.get(id=customer_id)
    except Customers.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    customer.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# File upload endpoints
@api_view(['POST'])
def upload_spec(request, project_id):
    """
    Upload a specification document for a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if 'spec_document' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle file upload
    uploaded_file = request.FILES['spec_document']
    file_path = f'documents/specs/{project_id}/{uploaded_file.name}'
    
    # Save the file
    path = default_storage.save(file_path, ContentFile(uploaded_file.read()))
    
    # Update project with file path
    # Note: You'll need to add this field to your Projects model
    # project.spec_document = path
    # project.save()
    
    return Response({'file_path': path}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def upload_sketch(request, project_id):
    """
    Upload a sketch for a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if 'sketch' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle file upload
    uploaded_file = request.FILES['sketch']
    file_path = f'documents/sketches/{project_id}/{uploaded_file.name}'
    
    # Save the file
    path = default_storage.save(file_path, ContentFile(uploaded_file.read()))
    
    # Update project with file path
    # Note: You'll need to add this field to your Projects model
    # project.sketch = path
    # project.save()
    
    return Response({'file_path': path}, status=status.HTTP_201_CREATED)

# Process and Matrix related endpoints
@api_view(['GET', 'POST', 'PUT'])
def process_map(request, project_id):
    """
    Handle process map operations for a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return process map data
        # You'll need to implement this based on your process map model
        return Response({'message': 'Process map data retrieval to be implemented'})
    
    elif request.method == 'POST':
        # Create new process map
        # You'll need to implement this based on your process map model
        return Response({'message': 'Process map creation to be implemented'})
    
    elif request.method == 'PUT':
        # Update process map
        # You'll need to implement this based on your process map model
        return Response({'message': 'Process map update to be implemented'})

@api_view(['GET', 'POST', 'PUT'])
def process_matrix(request, project_id):
    """
    Handle process matrix operations for a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return process matrix data
        # You'll need to implement this based on your process matrix model
        return Response({'message': 'Process matrix data retrieval to be implemented'})
    
    elif request.method == 'POST':
        # Create new process matrix
        # You'll need to implement this based on your process matrix model
        return Response({'message': 'Process matrix creation to be implemented'})
    
    elif request.method == 'PUT':
        # Update process matrix
        # You'll need to implement this based on your process matrix model
        return Response({'message': 'Process matrix update to be implemented'})

@api_view(['GET', 'POST', 'PUT'])
def controls_matrix(request, project_id):
    """
    Handle controls matrix operations for a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return controls matrix data
        # You'll need to implement this based on your controls matrix model
        return Response({'message': 'Controls matrix data retrieval to be implemented'})
    
    elif request.method == 'POST':
        # Create new controls matrix
        # You'll need to implement this based on your controls matrix model
        return Response({'message': 'Controls matrix creation to be implemented'})
    
    elif request.method == 'PUT':
        # Update controls matrix
        # You'll need to implement this based on your controls matrix model
        return Response({'message': 'Controls matrix update to be implemented'})

@api_view(['GET', 'POST', 'PUT'])
def budget(request, project_id):
    """
    Handle budget operations for a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return budget data
        # You'll need to implement this based on your budget model
        return Response({'message': 'Budget data retrieval to be implemented'})
    
    elif request.method == 'POST':
        # Create new budget
        # You'll need to implement this based on your budget model
        return Response({'message': 'Budget creation to be implemented'})
    
    elif request.method == 'PUT':
        # Update budget
        # You'll need to implement this based on your budget model
        return Response({'message': 'Budget update to be implemented'})

@api_view(['GET', 'POST'])
def quote(request, project_id):
    """
    Handle quote operations for a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return quote data
        # You'll need to implement this based on your quote model
        return Response({'message': 'Quote data retrieval to be implemented'})
    
    elif request.method == 'POST':
        # Generate new quote
        # You'll need to implement this based on your quote model
        return Response({'message': 'Quote generation to be implemented'})

# Basic view for the home page
def index(request):
    """
    Home page view - can be used for serving the React app
    """
    return HttpResponse("Welcome to PrecisionFlow - Plater Builder Application")

# Utility function to get equipment type choices
@api_view(['GET'])
def equipment_type_choices(request):
    """
    Return all equipment type choices
    """
    choices = []
    for choice in EquipmentTypeChoices.choices:
        choices.append({
            'value': choice[0],
            'label': choice[1]
        })
    return Response(choices)