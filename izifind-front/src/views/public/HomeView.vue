<template>
  <section id="hero" class="legacy-hero">
    <div class="hero-slide" :style="{ backgroundImage: `url(${heroImage})` }">
      <div class="carousel-container">
        <div class="site-container hero-content">
          <h2>Donnez-vous plus de chance de retrouver vos objets perdus</h2>
          <p>
            Vous avez perdu ou trouve un objet? Declarez-le rapidement afin que nous nous mobilisions pour vous
            aider a le retrouver.
          </p>
          <div class="hero-actions">
            <RouterLink to="/lost" class="btn-get-started">J'ai perdu</RouterLink>
            <RouterLink to="/found" class="btn-get-started">J'ai trouve</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>

  <main id="main">
    <section id="featured-services" class="featured-services section-bg">
      <div class="site-container">
        <div class="section-title">
          <h2>Comment ca marche?</h2>
          <p>Trop facile de retrouver votre objet perdu</p>
        </div>

        <div class="three-cols">
          <div v-for="step in steps" :key="step.title" class="icon-box">
            <div class="legacy-icon" aria-hidden="true">
              <svg v-if="step.icon === 'declare'" viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M8 3.5h5.8L18.5 8v12a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V5A1.5 1.5 0 0 1 8 3.5Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path
                  d="M13.8 3.5V8h4.7"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path
                  d="M9 12h6M9 15h4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
              <svg v-else-if="step.icon === 'verify'" viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M12 3 4.5 6.2v4.6c0 4.8 3.2 8.9 7.5 10.7 4.3-1.8 7.5-5.9 7.5-10.7V6.2L12 3Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path
                  d="m9.2 12.3 1.9 1.9 3.8-4.1"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.9"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M7 8.5h10.5l-1 10H8L7 8.5Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path
                  d="M9.5 8.5a2.5 2.5 0 0 1 5 0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
                <path
                  d="M10.3 12v4.2M13.7 12v4.2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <h4 class="title"><span>{{ step.title }}</span></h4>
            <p class="description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="about-section">
      <div class="site-container about-grid">
        <div class="about-copy">
          <span class="section-kicker">A Propos</span>
          <h2>Un point de rencontre fiable entre objets perdus et personnes qui les retrouvent</h2>
          <p>
            IZIFIND centralise les declarations, facilite la verification des objets et accompagne leur restitution
            avec un suivi simple pour les particuliers, les agences et les partenaires.
          </p>
        </div>
        <div class="about-list">
          <div>
            <strong>Declaration guidee</strong>
            <span>Les informations utiles sont collectees des le depart pour accelerer la recherche.</span>
          </div>
          <div>
            <strong>Verification claire</strong>
            <span>Chaque restitution peut etre appuyee par des details et preuves d'appartenance.</span>
          </div>
          <div>
            <strong>Reseau local</strong>
            <span>Les partenaires et points de depot augmentent les chances de retrouver rapidement un objet.</span>
          </div>
        </div>
      </div>
    </section>

    <section id="why-us" class="why-us">
      <div class="site-container">
        <div class="section-title">
          <h2>IZIFIND en chiffre</h2>
        </div>
        <div class="stats-mosaic">
          <div v-for="item in stats" :key="item.label" class="content-item">
            <span>{{ item.value }}</span>
            <h4>{{ item.label }}</h4>
          </div>
        </div>
      </div>
    </section>

    <section id="clients" class="clients">
      <div class="site-container">
        <div class="section-title">
          <h2>Ils nous font confiance</h2>
          <p>Nos partenaires accompagnent la recuperation et la restitution des objets au quotidien.</p>
        </div>
        <div class="client-strip">
          <img v-for="client in clients" :key="client" :src="client" alt="Partenaire" />
        </div>
      </div>
    </section>

    <section id="services" class="services-section section-bg">
      <div class="site-container">
        <div class="section-title">
          <h2>Services</h2>
          <p>Des parcours simples pour declarer, rechercher et restituer les objets.</p>
        </div>
        <div class="three-cols">
          <RouterLink v-for="service in services" :key="service.title" class="service-card" :to="service.to">
            <span class="legacy-icon" aria-hidden="true">
              <svg v-if="service.icon === 'lost'" viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M12 21s-6.5-4.35-6.5-9.5A6.5 6.5 0 0 1 12 5a6.5 6.5 0 0 1 6.5 6.5C18.5 16.65 12 21 12 21Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 8.2v4.1"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
                <circle cx="12" cy="15.6" r="1" fill="currentColor" />
              </svg>
              <svg v-else-if="service.icon === 'found'" viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M6.5 12.4 10 16l7.5-7.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.9"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 21a9 9 0 1 0-9-9"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" role="img" focusable="false">
                <circle
                  cx="11"
                  cy="11"
                  r="5.8"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
                <path
                  d="m15.2 15.2 3.8 3.8"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <h4>{{ service.title }}</h4>
            <p>{{ service.description }}</p>
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import heroImage from '../../assets/legacy/img/slide/carousel.png'
import client1 from '../../assets/legacy/img/clients/client-1.png'
import client2 from '../../assets/legacy/img/clients/client-2.png'
import client3 from '../../assets/legacy/img/clients/client-3.png'
import client4 from '../../assets/legacy/img/clients/client-4.png'
import client5 from '../../assets/legacy/img/clients/client-5.png'
import client6 from '../../assets/legacy/img/clients/client-6.png'

const stats = [
  { value: 500, label: 'Objets declares perdus' },
  { value: 400, label: 'Objets declares trouves' },
  { value: 350, label: 'Objets rendus aux proprietaires' },
  { value: 20, label: 'Partenaires' },
  { value: 100, label: 'Temoignages positifs' },
  { value: 5, label: 'Distinctions' },
]

const steps = [
  {
    icon: 'declare',
    title: "Declarez l'objet",
    description: 'Renseignez les informations precises de votre objet dans le formulaire.',
  },
  {
    icon: 'verify',
    title: "Authentifiez l'objet",
    description: "Si l'objet est declare perdu, prouvez-nous qu'il vous appartient.",
  },
  {
    icon: 'recover',
    title: "Recuperez l'objet",
    description: 'Passez dans une agence ou choisissez une solution de livraison.',
  },
]

const services = [
  {
    icon: 'lost',
    title: 'Objet perdu',
    description: "Signalez rapidement votre objet et laissez des details utiles pour l'identifier.",
    to: '/lost',
  },
  {
    icon: 'found',
    title: 'Objet trouve',
    description: "Declarez un objet retrouve pour aider son proprietaire a le recuperer.",
    to: '/found',
  },
  {
    icon: 'search',
    title: 'Recherche',
    description: 'Consultez les objets declares et filtrez les annonces disponibles.',
    to: '/catalog',
  },
]

const clients = [client1, client2, client3, client4, client5, client6]
</script>
