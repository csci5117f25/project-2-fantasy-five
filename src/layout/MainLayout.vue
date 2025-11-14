<template>
  <div class="main-layout">
    <header class="app-header">
      <div class="brand">
        <h1>CLOSET CLOUD</h1>
      </div>
      <nav class="main-nav">
        <router-link to="/app/outfits" class="nav-link" :class="{ active: $route.name === 'Outfits' }">
          Outfit
        </router-link>
        <router-link to="/app/clothing" class="nav-link" :class="{ active: $route.name === 'Clothing' }">
          Clothing
        </router-link>
        <router-link to="/app/try-on" class="nav-link" :class="{ active: $route.name === 'TryOn' }">
          TryOn
        </router-link>
      </nav>
      <button class="profile-btn" @click="$router.push('/app/profile')">
        👤
      </button>
    </header>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <button class="fab" @click="$router.push('/app/create')">
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
.main-layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand h1 {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-link.active {
  color: #000;
  font-weight: bold;
  border-bottom-color: #000;
}

.profile-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
}

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #000;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: transform 0.2s;
  z-index: 1000;
}

.fab:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .app-header {
    padding: 0.75rem;
  }
  
  .main-nav {
    gap: 1rem;
  }
  
  .brand h1 {
    font-size: 1.1rem;
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