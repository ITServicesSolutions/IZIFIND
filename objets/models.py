from django.db import models
# Create your models here.

class Categorie(models.Model):
    
    # Appareils électroniques
    #Ajouter les types d'objets 
    
    name = models.CharField(max_length=200, verbose_name="Titre")
    description = models.TextField(verbose_name="Description", null = True, blank=True)

    class Meta:
        verbose_name = "Catégorie *"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class SousCategorie(models.Model):

    #Sous Catégorie de l'objet
    #On distingue:
    # - l'appareil photo, Ordinateur, Disque Dur  
    # - Poupée, peluche etc....
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE, verbose_name="Catégorie de l'objet")
    name = models.CharField(max_length=200, verbose_name="Sous-Catégorie *")
    description = models.TextField(verbose_name="Description", null = True, blank = True)

    class Meta:
        verbose_name = "Sous-Catégorie"
        verbose_name_plural = "Sous-Catégories"

    def __str__(self):
        return self.name

class Marque(models.Model):

    #Pour une sous catégorie, on distingue plusieurs marque d'objet:
    # Ex: Ordinateur
    # - HP,Dell, Accer, Lenovo ...
    # - Samsumg, Macs etc...


    souscategorie = models.ForeignKey(
        SousCategorie,
        on_delete = models.CASCADE,
        verbose_name = 'SousCatégorie',
    )
    name = models.CharField(max_length=200, verbose_name="Marque d'objets")
    description = models.TextField(verbose_name="Description", null = True)

    class Meta:
        verbose_name = "Marque"
        verbose_name_plural = "Marques"

    def __str__(self):
        return self.name

class Couleur(models.Model):
    
    #Pour chaque objet, on distingue plusieurs couleur d'objet:
    # Ex: Ordinateur
    # - Noir, grise, marron etc..

    name = models.CharField(max_length=200, verbose_name="Couleur")
    description = models.TextField(verbose_name="Description", null = True)

    class Meta:
        verbose_name = "Couleur"
        verbose_name_plural = "Couleur"

    def __str__(self):
        return self.name


class Statut(models.Model):
    
    #Statut de l'objet
    #perdu, trouve ou volé
    
    name = models.CharField(max_length=100, verbose_name="Désignation")
    description = models.TextField(verbose_name="Description", null = True)

    class Meta:
        verbose_name = "Statut"
        verbose_name_plural = "Statuts"

    def __str__(self):
        return self.name

class TitreObjet(models.Model):

    type = models.ForeignKey(
        SousCategorie, 
        on_delete = models.CASCADE,
        verbose_name = 'Type associé',
        )
    name = models.CharField(max_length=200, verbose_name="Désigantion")
    description = models.TextField(verbose_name="Description", null = True, blank = True)


    class Meta:
        verbose_name = "TitreObjet"
        verbose_name_plural = "TitreObjets"

    def __str__(self):
        return self.name


class Objet(models.Model):
    
    # Tous les objets (retrouvés, perdus, volés)    
    categorie = models.ForeignKey(
        Categorie,
        on_delete=models.CASCADE,
        verbose_name= "Catégorie",
        null=True
    )
        
    souscategorie = models.ForeignKey(
        SousCategorie, 
        on_delete = models.CASCADE, 
        related_name = 'souscategorie',
        verbose_name = "Sous-Categorie d'objet",
        null=True
        )

    marque = models.ForeignKey(
        Marque,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        related_name = 'marque'
    )

    couleur = models.ForeignKey(
        Couleur,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        verbose_name = 'Couleur'
    )

    statut = models.ForeignKey(
        Statut,
        on_delete = models.CASCADE,
        verbose_name = "Statut"
    )
    
    description = models.TextField(verbose_name="Description")
    
    date = models.DateTimeField(auto_now_add=True)

    date_action = models.DateField(verbose_name='Date perte/retrouvé')
    
    # Pour gérer les suppressions. On ne supprime jamais les données d'une BD
    
    is_public = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Objet"
        verbose_name_plural = "Objets"

    def __str__(self):
        return self.title


class ModifierObjet(models.Model):

    objet = models.ForeignKey(
        Objet,
        verbose_name='Objet',
        on_delete = models.CASCADE
        )
    change = models.TextField(verbose_name = 'Changement effetué')

    confirm = models.BooleanField(default = False, verbose_name='Modification Confirmer')

    date = models.DateTimeField(auto_now_add = True)

    class Meta:
        verbose_name = "ModifierObjet"
        verbose_name_plural = "ModeifierObjets"

    def __str__(self):
        return str(self.objet)


class ImageObjet(models.Model):
    
    object = models.ForeignKey(
        Objet,
        on_delete = models.CASCADE,
        verbose_name = "Objet",
        )
    name = models.CharField(max_length=100, verbose_name = "Titre de l'image")
    image = models.ImageField(upload_to = "objet/")
    caption = models.TextField(verbose_name = "Caption", null = True, blank = True)
    date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Image"
        verbose_name_plural = "Images"

    def __str__(self):
        return self.name

