<template>
  <main>
    <section class="breadcrumbs">
      <div class="site-container">
        <ol>
          <li><RouterLink to="/">Accueil</RouterLink></li>
          <li>J'ai perdu</li>
        </ol>
      </div>
    </section>

    <DeclarationWizard
      title="Declarez un objet"
      subtitle="Qu'avez-vous perdu?"
      status-label="Perdu"
      :status-id="LOST_STATUS_ID"
      :with-reward-question="true"
    />
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DeclarationWizard from '../../components/DeclarationWizard.vue'
import { LOST_STATUS_ID } from '../../services/objets'
</script>
