<template>
  <div class="main-layout d-flex flex-column min-vh-100 bg-light">

    <!-- Header -->
    <header class="app-header sticky-top bg-white border-bottom py-3 px-3 d-flex justify-content-between align-items-center">
      <!-- Brand -->
      <div class="brand">
        <h1 class="h5 fw-bold m-0 text-dark">CLOSET CLOUD</h1>
      </div>

      <!-- Nav -->
      <nav class="main-nav d-flex gap-3">
        <router-link 
          to="/app/outfits" 
          class="nav-link text-secondary fw-medium" 
          :class="{ active: $route.name === 'Outfits' }">
          Outfit
        </router-link>
        <router-link 
          to="/app/clothing" 
          class="nav-link text-secondary fw-medium" 
          :class="{ active: $route.name === 'Clothing' }">
          Clothing
        </router-link>
        <router-link 
          to="/app/try-on" 
          class="nav-link text-secondary fw-medium" 
          :class="{ active: $route.name === 'TryOn' }">
          TryOn
        </router-link>
      </nav>

      <!-- Profile Button -->
      <button class="profile-btn btn p-0 fs-5" @click="$router.push('/app/profile')">
        👤
      </button>
    </header>

    <!-- Main Content -->
    <main class="main-content flex-grow-1 container py-4">
      <router-view />
    </main>

    <!-- Floating Action Button -->
    <button class="fab btn btn-dark rounded-circle" @click="$router.push('/app/create')">
      +
    </button>

  </div>
</template>

<script>
export default {
  name: 'MainLayout'
}
</script>

<style scoped>
.nav-link.active {
  color: #000 !important;
  font-weight: 700;
  border-bottom: 2px solid #000;
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
