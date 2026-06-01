<template>
  <main>
    <section class="breadcrumbs">
      <div class="site-container">
        <ol>
          <li><RouterLink to="/">Accueil</RouterLink></li>
          <li>J'ai trouve</li>
        </ol>
      </div>
    </section>

    <DeclarationWizard
      title="Declarez un objet"
      subtitle="Qu'avez-vous trouve?"
      status-label="Trouve"
      :status-id="FOUND_STATUS_ID"
      :with-reward-question="false"
    />
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DeclarationWizard from '../../components/DeclarationWizard.vue'
import { FOUND_STATUS_ID } from '../../services/objets'
</script>
