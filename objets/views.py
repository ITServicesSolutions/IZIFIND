from django.shortcuts import render
from .models import *
from django.http import JsonResponse


def index(request):
    statuts = Statut.objects.all()
    context = {'statuts':statuts}
    return render(request, 'pages/index.html',context)

def services(request):
    return render(request, 'pages/service.html')

def perdu(request):
    categories = Categorie.objects.all()
    souscategories = SousCategorie.objects.all()
    marques = Marque.objects.all()
    couleurs = Couleur.objects.all()
    context = {
        'categories':categories,
        'souscategories':souscategories,
        'marques':marques,
        'couleurs':couleurs,
    }
    return render(request, 'pages/perdu.html',context)


def trouve(request):
    categories = Categorie.objects.all()
    souscategories = SousCategorie.objects.all()
    marques = Marque.objects.all()
    couleurs = Couleur.objects.all()
    context = {
        'categories':categories,
        'souscategories':souscategories,
        'marques':marques,
        'couleurs':couleurs,
    }
    return render(request, 'pages/trouve.html',context)

def about(request):
    return render(request, 'pages/about.html')

def contact(request):
    return render(request, 'pages/contact.html')


def get_sousCategorie(request,categorie):
    sousCa = SousCategorie.objects.filter(categorie=categorie).values('id','name')
    return JsonResponse({'data':list(sousCa)},safe=False)

def get_marque(request,souscategorie):
    marque = Marque.objects.filter(souscategorie=souscategorie).values('id','name')
    return JsonResponse({'data':list(marque)},safe=False)
