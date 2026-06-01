<template>
  <main>
    <section class="contact-hero">
      <div class="site-container contact-hero-inner">
        <div>
          <ol class="contact-breadcrumbs">
            <li><RouterLink to="/">Accueil</RouterLink></li>
            <li>Contact</li>
          </ol>
          <h1>Contact</h1>
          <p>Une question, une information sur un objet ou besoin d'aide pour une declaration ? L'equipe IZIFIND vous repond.</p>
        </div>
      </div>
    </section>

    <section class="contact">
      <div class="site-container">
        <div class="contact-grid">
          <div class="contact-info-card">
            <span class="section-kicker">Nos coordonnees</span>
            <h2>Restons en contact</h2>
            <p class="contact-lead">Nous vous orientons vers la bonne demarche pour declarer, rechercher ou recuperer un objet.</p>
            <div class="contact-row">
              <span class="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <path
                    d="M4.5 7.5h15v9h-15z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                  <path
                    d="m5.5 8.5 6.5 5 6.5-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <div>
                <h4>Adresse</h4>
                <p>Fidjrosse Calvaire, Von Restaurant Salon,<br />Cotonou<br />Rep. du Benin</p>
              </div>
            </div>
            <div class="contact-row">
              <span class="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <circle
                    cx="12"
                    cy="12"
                    r="7.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="M15.2 9.1v4.1c0 1-.8 1.8-1.8 1.8-.9 0-1.7-.7-1.7-1.7v-3.9h1.4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M15.2 11.1c0-1.8-1.4-3.1-3.2-3.1s-3.2 1.4-3.2 3.1 1.4 3.1 3.2 3.1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              <div>
                <h4>Email</h4>
                <p>contact@it-servicegroup.com</p>
              </div>
            </div>
            <div class="contact-row">
              <span class="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <path
                    d="M7.5 4.5h3l1.2 5.2-1.8 1.8a12.5 12.5 0 0 0 6.6 6.6l1.8-1.8 5.2 1.2v3a2 2 0 0 1-2 2A18.5 18.5 0 0 1 5.5 6.5a2 2 0 0 1 2-2Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <div>
                <h4>Telephone</h4>
                <p>+229 01 52 52 52 31</p>
              </div>
            </div>
          </div>

          <form class="contact-form" @submit.prevent>
            <h3>Envoyer un message</h3>
            <div class="form-row">
              <input class="form-control" placeholder="Votre nom" />
              <input class="form-control" placeholder="Votre email" type="email" />
            </div>
            <input class="form-control" placeholder="Sujet" />
            <textarea class="form-control" rows="6" placeholder="Message"></textarea>
            <button class="legacy-primary" type="submit">Envoyer</button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
