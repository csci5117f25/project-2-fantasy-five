import { createRouter, createWebHistory } from 'vue-router'
// import { auth } from '@/firebase'

const routes = [
  {
    path: '/',
    name: 'Splash',
    component: () => import('@/views/SplashView.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Closet Cloud - Track Your Style'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Login - Closet Cloud'
    }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('@/views/SignUpView.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Sign Up - Closet Cloud'
    }
  },
  {
    path: '/app',
    name: 'MainLayout',
    component: () => import('@/layout/MainLayout.vue'), // Fixed path: layouts not layout
    meta: { 
      requiresAuth: true,
      title: 'My Closet - Closet Cloud'
    },
    redirect: '/app/outfits', // Redirect to outfits by default
    children: [
      {
        path: 'outfits',
        name: 'Outfits',
        component: () => import('@/views/OutfitsView.vue'),
        meta: { 
          title: 'My Outfits - Closet Cloud'
        }
      },
      {
        path: 'clothing',
        name: 'Clothing',
        component: () => import('@/views/ClothingView.vue'),
        meta: { 
          title: 'My Clothing - Closet Cloud'
        }
      },
    //   {
    //     path: 'try-on',
    //     name: 'TryOn',
    //     component: () => import('@/views/TryOnView.vue'),
    //     meta: { 
    //       title: 'Virtual Try-On - Closet Cloud'
    //     }
    //   },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { 
          title: 'Profile - Closet Cloud'
        }
      },
      {
        path: 'create',
        name: 'Create',
        component: () => import('@/views/CreateView.vue'),
        meta: { 
          title: 'Add New Item - Closet Cloud'
        }
      },
      {
        path: 'clothing/:id',
        name: 'ClothingDetail',
        component: () => import('@/views/ClothingDetail.vue'),
        meta: { 
          title: 'Clothing Details - Closet Cloud'
        }
      },
      {
        path: 'clothing/:id/edit',
        name: 'EditClothing',
        component: () => import('@/views/EditClothingView.vue'),
        meta: { 
          title: 'Edit Clothing - Closet Cloud'
        }
      },
      {
        path: 'outfits/:id',
        name: 'OutfitDetail',
        component: () => import('@/views/OutfitDetail.vue'),
        meta: { 
          title: 'Outfit Details - Closet Cloud'
        }
      },
      {
        path: 'outfits/:id/edit',
        name: 'EditOutfit',
        component: () => import('@/views/EditOutfitView.vue'),
        meta: { 
          title: 'Edit Outfit - Closet Cloud'
        }
      }
    ]
  },
  // 404 Catch-all route
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    // redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guards (commented out for now)
// router.beforeEach((to, from, next) => {
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
//   const isAuthenticated = auth.currentUser

//   // Update document title
//   if (to.meta.title) {
//     document.title = to.meta.title
//   }

//   if (requiresAuth && !isAuthenticated) {
//     // Redirect to splash page if not authenticated
//     next('/')
//   } else if ((to.name === 'Splash' || to.name === 'Login' || to.name === 'SignUp') && isAuthenticated) {
//     // Redirect to app if already authenticated
//     next('/app/outfits')
//   } else {
//     // Continue to route
//     next()
//   }
// })

// Simple navigation guard for demo
router.beforeEach((to, from, next) => {
  // Update document title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // For demo purposes, allow all routes
  // In production, you'd use the commented auth logic above
  next()
})

export default router