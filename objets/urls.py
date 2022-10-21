from django.urls import path
from .views import *
urlpatterns = [
    path('', index, name='index'),
    path('about', about, name='about'),
    path('perdu', perdu, name='perdu'),
    path('trouve', trouve, name='trouve'),
    path('services', services, name='services'),
    path('contact', contact, name = 'contact'),
    path('<str:categorie>', get_sousCategorie, name="get_sousCategorie"),
    path('marque/<str:souscategorie>', get_marque, name="get_marque"),
]
