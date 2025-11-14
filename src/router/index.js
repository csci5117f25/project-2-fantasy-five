import { createRouter, createWebHistory } from 'vue-router'
// import { auth } from '@/firebase'

const routes = [
  {
    path: '/app',
    name: 'MainLayout',
    component: () => import('@/layout/MainLayout.vue'),
    meta: { 
      requiresAuth: true,
      title: 'My Closet - Closet Cloud'
    }
  },
  {
    path: '/',
    name: 'Splash',
    component: () => import('@/views/SplashView.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Closet Cloud - Track Your Style'
    }
  },
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: () => import('@/views/LoginView.vue'),
  //   meta: { 
  //     requiresAuth: false,
  //     title: 'Login - Closet Cloud'
  //   }
  // },
  // {
  //   path: '/signup',
  //   name: 'SignUp',
  //   component: () => import('@/views/SignUpView.vue'),
  //   meta: { 
  //     requiresAuth: false,
  //     title: 'Sign Up - Closet Cloud'
  //   }
  // },
  // {
  //   path: '/app',
  //   name: 'MainLayout',
  //   component: () => import('@/layouts/MainLayout.vue'),
  //   meta: { 
  //     requiresAuth: true,
  //     title: 'My Closet - Closet Cloud'
  //   },
  //   redirect: '/app/outfits',
  //   children: [
  //     {
  //       path: 'outfits',
  //       name: 'Outfits',
  //       component: () => import('@/views/OutfitsView.vue'),
  //       meta: { 
  //         title: 'My Outfits - Closet Cloud'
  //       }
  //     },
  //     {
  //       path: 'clothing',
  //       name: 'Clothing',
  //       component: () => import('@/views/ClothingView.vue'),
  //       meta: { 
  //         title: 'My Clothing - Closet Cloud'
  //       }
  //     },
  //     {
  //       path: 'try-on',
  //       name: 'TryOn',
  //       component: () => import('@/views/TryOnView.vue'),
  //       meta: { 
  //         title: 'Virtual Try-On - Closet Cloud'
  //       }
  //     },
  //     {
  //       path: 'profile',
  //       name: 'Profile',
  //       component: () => import('@/views/ProfileView.vue'),
  //       meta: { 
  //         title: 'Profile - Closet Cloud'
  //       }
  //     },
  //     {
  //       path: 'create',
  //       name: 'Create',
  //       component: () => import('@/views/CreateView.vue'),
  //       meta: { 
  //         title: 'Add New Item - Closet Cloud'
  //       }
  //     },
  //     {
  //       path: 'clothing/:id',
  //       name: 'ClothingDetail',
  //       component: () => import('@/views/ClothingDetailView.vue'),
  //       meta: { 
  //         title: 'Clothing Details - Closet Cloud'
  //       }
  //     },
  //     {
  //       path: 'outfits/:id',
  //       name: 'OutfitDetail',
  //       component: () => import('@/views/OutfitDetailView.vue'),
  //       meta: { 
  //         title: 'Outfit Details - Closet Cloud'
  //       }
  //     }
  //   ]
  // },
  
  // 404 Catch-all route
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
