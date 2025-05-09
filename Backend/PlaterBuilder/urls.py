from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for REST framework viewsets (if needed in the future)
router = DefaultRouter()
# You can register viewsets here, for example:
# router.register(r'projects', views.ProjectViewSet)
# router.register(r'customers', views.CustomerViewSet)

# URL patterns for your app
urlpatterns = [
    # Basic views
    path("", views.index, name="index"),
    
    # Project-related API endpoints
    path("api/projects/", views.project_list, name="project_list"),
    path("api/projects/create/", views.project_create, name="project_create"),
    path("api/projects/<str:project_id>/", views.project_detail, name="project_detail"),
    path("api/projects/<str:project_id>/edit/", views.project_edit, name="project_edit"),
    path("api/projects/<str:project_id>/delete/", views.project_delete, name="project_delete"),
    
    # Customer-related API endpoints
    path("api/customers/", views.customer_list, name="customer_list"),
    path("api/customers/create/", views.customer_create, name="customer_create"),
    path("api/customers/<int:customer_id>/", views.customer_detail, name="customer_detail"),
    path("api/customers/<int:customer_id>/edit/", views.customer_edit, name="customer_edit"),
    path("api/customers/<int:customer_id>/delete/", views.customer_delete, name="customer_delete"),
    
    # Process Map API endpoints
    path("api/projects/<str:project_id>/process-map/", views.process_map, name="process_map"),
    
    # Matrix API endpoints
    path("api/projects/<str:project_id>/process-matrix/", views.process_matrix, name="process_matrix"),
    path("api/projects/<str:project_id>/controls-matrix/", views.controls_matrix, name="controls_matrix"),
    
    # Budget and quote API endpoints
    path("api/projects/<str:project_id>/budget/", views.budget, name="budget"),
    path("api/projects/<str:project_id>/quote/", views.quote, name="quote"),
    
    # Upload and document API endpoints
    path("api/projects/<str:project_id>/upload-spec/", views.upload_spec, name="upload_spec"),
    path("api/projects/<str:project_id>/upload-sketch/", views.upload_sketch, name="upload_sketch"),
    
    # Utility API endpoints
    path("api/equipment-types/", views.equipment_type_choices, name="equipment_type_choices"),
    
    # The original URLs for browser navigation (these will redirect to the React app in production)
    path("projects/", views.index),
    path("projects/<str:project_id>/", views.index),
    path("projects/<str:project_id>/edit/", views.index),
    path("customers/", views.index),
    path("customers/<int:customer_id>/", views.index),
]

# Add the router URLs to our urlpatterns
urlpatterns += router.urls