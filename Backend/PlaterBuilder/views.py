from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Projects, Customers, EquipmentTypeChoices, ProcessMapEntry, ProductionGoal, SimulationParameters, SimulationResult
from .serializers import ProjectsSerializer, CustomersSerializer, ProcessMapEntrySerializer, ProductionGoalSerializer, SimulationParametersSerializer, SimulationResultSerializer
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


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def process_map(request, project_id):
    """
    Handle process map operations for a project
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return all process map entries for this project
        entries = ProcessMapEntry.objects.filter(project=project)
        serializer = ProcessMapEntrySerializer(entries, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create a new process map entry
        request.data['project'] = project.id
        serializer = ProcessMapEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT':
        # Update an existing process map entry
        try:
            entry_id = request.data.get('id')
            entry = ProcessMapEntry.objects.get(id=entry_id, project=project)
            serializer = ProcessMapEntrySerializer(entry, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ProcessMapEntry.DoesNotExist:
            return Response({"error": "Process map entry not found"}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE':
        # Delete a process map entry
        try:
            entry_id = request.data.get('id')
            entry = ProcessMapEntry.objects.get(id=entry_id, project=project)
            entry.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProcessMapEntry.DoesNotExist:
            return Response({"error": "Process map entry not found"}, status=status.HTTP_404_NOT_FOUND)

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

# views.py additions

@api_view(['GET', 'POST', 'PUT'])
def production_goal(request, project_id):
    """
    Get or update production goals
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Get or create production goal
        goal, created = ProductionGoal.objects.get_or_create(project=project)
        serializer = ProductionGoalSerializer(goal)
        return Response(serializer.data)
    
    elif request.method in ['POST', 'PUT']:
        # Get existing or create new
        try:
            goal = ProductionGoal.objects.get(project=project)
            serializer = ProductionGoalSerializer(goal, data=request.data, partial=True)
        except ProductionGoal.DoesNotExist:
            request.data['project'] = project.id
            serializer = ProductionGoalSerializer(data=request.data)
        
        if serializer.is_valid():
            goal = serializer.save()
            
            # Update other targets based on primary target
            primary = request.data.get('primary_target', goal.primary_target)
            
            # If we have simulation parameters, use them to calculate other targets
            try:
                params = SimulationParameters.objects.get(project=project)
                hours_per_day = params.working_hours_per_day
                days_per_week = params.working_days_per_week
            except SimulationParameters.DoesNotExist:
                hours_per_day = 8
                days_per_week = 5
            
            # Update the targets based on the primary target
            if primary == 'hour' and request.data.get('target_parts_per_hour'):
                pph = float(request.data.get('target_parts_per_hour'))
                goal.target_parts_per_day = pph * hours_per_day
                goal.target_parts_per_week = goal.target_parts_per_day * days_per_week
                goal.target_parts_per_month = goal.target_parts_per_week * 4
                goal.target_parts_per_year = goal.target_parts_per_month * 12
                goal.save()
            elif primary == 'day' and request.data.get('target_parts_per_day'):
                ppd = float(request.data.get('target_parts_per_day'))
                goal.target_parts_per_hour = ppd / hours_per_day
                goal.target_parts_per_week = ppd * days_per_week
                goal.target_parts_per_month = goal.target_parts_per_week * 4
                goal.target_parts_per_year = goal.target_parts_per_month * 12
                goal.save()
            elif primary == 'week' and request.data.get('target_parts_per_week'):
                ppw = float(request.data.get('target_parts_per_week'))
                goal.target_parts_per_day = ppw / days_per_week
                goal.target_parts_per_hour = goal.target_parts_per_day / hours_per_day
                goal.target_parts_per_month = ppw * 4
                goal.target_parts_per_year = goal.target_parts_per_month * 12
                goal.save()
            elif primary == 'month' and request.data.get('target_parts_per_month'):
                ppm = float(request.data.get('target_parts_per_month'))
                goal.target_parts_per_week = ppm / 4
                goal.target_parts_per_day = goal.target_parts_per_week / days_per_week
                goal.target_parts_per_hour = goal.target_parts_per_day / hours_per_day
                goal.target_parts_per_year = ppm * 12
                goal.save()
            elif primary == 'year' and request.data.get('target_parts_per_year'):
                ppy = float(request.data.get('target_parts_per_year'))
                goal.target_parts_per_month = ppy / 12
                goal.target_parts_per_week = goal.target_parts_per_month / 4
                goal.target_parts_per_day = goal.target_parts_per_week / days_per_week
                goal.target_parts_per_hour = goal.target_parts_per_day / hours_per_day
                goal.save()
            
            # Return updated data
            serializer = ProductionGoalSerializer(goal)
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'PUT'])
def simulation_parameters(request, project_id):
    """
    Get or update simulation parameters
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Get or create simulation parameters
        parameters, created = SimulationParameters.objects.get_or_create(project=project)
        serializer = SimulationParametersSerializer(parameters)
        return Response(serializer.data)
    
    elif request.method in ['POST', 'PUT']:
        # Get existing or create new
        try:
            parameters = SimulationParameters.objects.get(project=project)
            serializer = SimulationParametersSerializer(parameters, data=request.data, partial=True)
        except SimulationParameters.DoesNotExist:
            request.data['project'] = project.id
            serializer = SimulationParametersSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            
            # If parameters are updated, recalculate hoist count
            from .services import ProductionSimulator
            simulator = ProductionSimulator(project_id)
            optimal_hoists = simulator.calculate_optimal_hoists()
            
            parameters = SimulationParameters.objects.get(project=project)
            parameters.calculated_hoist_count = optimal_hoists
            parameters.save()
            
            # Return updated data
            serializer = SimulationParametersSerializer(parameters)
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def run_simulation(request, project_id):
    """
    Run production simulation and return results
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # Get simulation history for GET requests
    if request.method == 'GET':
        simulations = SimulationResult.objects.filter(project=project).order_by('-simulation_date')
        serializer = SimulationResultSerializer(simulations, many=True)
        return Response(serializer.data)
    
    # Run new simulation for POST requests
    elif request.method == 'POST':
        from .services import ProductionSimulator
        
        # Get simulation name if provided
        name = request.data.get('name', "Simulation Run")
        
        simulator = ProductionSimulator(project_id)
        result = simulator.run_simulation(name=name)
        
        if "error" in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def quick_simulation(request, project_id):
    """
    Run a quick simulation without saving results
    """
    try:
        project = Projects.objects.get(project_id=project_id)
    except Projects.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    from .services import ProductionSimulator
    
    simulator = ProductionSimulator(project_id)
    
    # Get manual hoist count if provided in query params
    hoist_count = request.query_params.get('hoists', None)
    if hoist_count:
        try:
            hoist_count = int(hoist_count)
        except ValueError:
            hoist_count = None
    
    results = simulator.calculate_throughput(hoist_count=hoist_count)
    
    if "error" in results:
        return Response(results, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(results)