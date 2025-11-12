<!-- views/SplashView.vue -->
<template>
  <div class="splash">
    <div class="hero-section">
      <div class="logo-container">
        <h1 class="logo">CLOSET CLOUD</h1>
        <p class="tagline">Track what you wear<br>Simplify your Style</p>
      </div>
    </div>
    
    <div class="auth-section">
      <div class="auth-buttons">
        <button class="btn btn-primary" @click="$router.push('/signup')">
          Sign Up
        </button>
        <button class="btn btn-secondary" @click="$router.push('/login')">
          LOG IN
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SplashView'
}
</script>

<style scoped>
.splash {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.logo-container {
  text-align: center;
}

.logo {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
}

.tagline {
  font-size: 1.5rem;
  line-height: 1.4;
  opacity: 0.9;
}

.auth-section {
  padding: 2rem;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
  margin: 0 auto;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .logo {
    font-size: 2.5rem;
  }
  
  .tagline {
    font-size: 1.2rem;
  }
  
  .auth-section {
    padding: 1.5rem;
  }
}
</style>