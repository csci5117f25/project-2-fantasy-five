<template>
  <div class="main-layout d-flex flex-column min-vh-100 bg-body">

    <!-- Header -->
    <header class="app-header sticky-top border-bottom py-3 px-3 d-flex justify-content-between align-items-center">
      <!-- Brand -->
      <router-link to="/app/outfits" class="brand text-decoration-none">
        <h1 class="h5 fw-bold m-0 text-body">CLOSET CLOUD</h1>
      </router-link>

      <!-- Nav -->
      <nav class="main-nav d-flex gap-3">
        <router-link 
          to="/app/outfits" 
          class="nav-link text-body-secondary fw-medium" 
          :class="{ active: $route.name === 'Outfits' }">
          Outfit
        </router-link>
        <router-link 
          to="/app/clothing" 
          class="nav-link text-body-secondary fw-medium" 
          :class="{ active: $route.name === 'Clothing' }">
          Clothing
        </router-link>
        <router-link 
          to="/app/try-on" 
          class="nav-link text-body-secondary fw-medium" 
          :class="{ active: $route.name === 'TryOn' }">
          TryOn
        </router-link>
      </nav>

      <!-- Profile Button -->
      <button class="profile-btn btn p-0 fs-5 text-body" @click="$router.push('/app/profile')">
        👤
      </button>
    </header>

    <!-- Main Content -->
    <main class="main-content flex-grow-1 container py-4">
      <router-view />
    </main>

    <!-- Floating Action Button -->
    <button 
      v-if="showFab" 
      class="fab btn rounded-circle" 
      @click="handleFabClick"
    >
      +
    </button>

  </div>
</template>

<script>
export default {
  name: 'MainLayout',
  computed: {
    showFab() {
      const routeName = this.$route.name
      // Only show FAB on Outfits and Clothing views
      return routeName === 'Outfits' || routeName === 'Clothing'
    }
  },
  methods: {
    handleFabClick() {
      const currentRoute = this.$route.name
      if (currentRoute === 'Outfits') {
        this.$router.push('/app/create?type=Outfit')
      } else if (currentRoute === 'Clothing') {
        this.$router.push('/app/create?type=Clothing')
      } else {
        // Default to Clothing if on other pages
        this.$router.push('/app/create?type=Clothing')
      }
    }
  }
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1100;
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
}

/* Active nav link adapts to current theme */
.nav-link.active {
  color: var(--bs-body-color) !important;
  font-weight: 700;
  border-bottom: 2px solid var(--bs-body-color);
}

.brand {
  cursor: pointer;
}

.brand:hover h1 {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1000;

  background-color: var(--bs-body-color);
  color: var(--bs-body-bg);
  border: none;
}

.fab:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0.75rem;
  }
  
  .fab {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 3rem;
    height: 3rem;
    font-size: 1.2rem;
  }
}
</style>