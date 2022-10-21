from django.contrib import admin
from .models import *


admin.site.register(Categorie)
admin.site.register(SousCategorie)
admin.site.register(Marque)
admin.site.register(Couleur)
admin.site.register(Statut)
admin.site.register(Objet)
admin.site.register(ImageObjet)
admin.site.register(ModifierObjet)