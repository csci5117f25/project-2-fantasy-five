<template>
    <div class="splash">
    <div class="container-fluid auth-layout">
        <div class="row min-vh-100 align-items-center">
            <div class="col-lg-6 d-none d-lg-flex justify-content-center">
                <div class="brand-panel text-center text-lg-start">
                    <h1 class="display-3 fw-bold mb-3">
                        CLOSET CLOUD
                    </h1>
                    <p class="lead mb-1">Track what you wear!</p>
                    <p class="lead">Wear what you track!</p>
                </div>
            </div>

            <div class="col-lg-5 col-md-8 ms-auto">
                <div class="card shadow-sm auth-card">
                    <div class="card-body">
                        <h1 class="h4 mb-4 text-center">Log In</h1>

                        <form @submit.prevent="handleSubmit" novalidate>
                            <!-- Error messages -->
                            <div v-if="errors.length" class="alert alert-danger">
                                <p class="mb-2 fw-semibold">Oops! Let's fix the following problems first:</p>
                                <ul class="mb-0">
                                    <li v-for="(error, index) in errors" :key="index">
                                        {{ error }}
                                    </li>
                                </ul>
                            </div>

                            <!-- Email -->
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    class="form-control"
                                    v-model="form.email"
                                    required
                                />
                            </div>

                            <!-- Password -->
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    class="form-control"
                                    v-model="form.password"
                                    required
                                />
                            </div>

                            <!-- Log In button -->
                            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                                {{ loading ? 'Signing in...' : 'Log In' }}
                            </button>

                            <!-- Divider -->
                            <div class="my-3 text-center">
                                <span class="text-muted">or</span>
                            </div>

                            <!-- Google Sign In button -->
                            <button type="button" class="btn btn-outline-secondary w-100" @click="handleGoogleSignIn" :disabled="loading">
                                <i class="fab fa-google me-2"></i>
                                Continue with Google
                            </button>

                            <!-- Sign up link -->
                            <div class="mt-3 text-center">
                                <span>No account?</span>
                                <button
                                    type="button"
                                    class="btn btn-link p-0 ms-1 align-baseline"
                                    @click="goToSignUp"
                                >
                                    Sign up
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'

export default {
    name: 'LoginView',
    setup() {
        const router = useRouter()

        const form = ref({
            email: '',
            password: ''
        })

        const errors = ref([])
        const loading = ref(false)

        const handleSubmit = async () => {
            errors.value = []
            loading.value = true

            if (!form.value.email.trim()) {
                errors.value.push('Email is required.')
            }

            if (!form.value.password) {
                errors.value.push('Password is required.')
            }

            if (errors.value.length > 0) {
                loading.value = false
                return
            }

            try {
                await signInWithEmailAndPassword(auth, form.value.email.trim(), form.value.password)
                await router.push('/app/outfits')
                form.value.email = ''
                form.value.password = ''
            } catch (error) {
                console.error('Login error:', error)
                if (error.code === 'auth/user-not-found') errors.value.push('No account found with this email.')
                else if (error.code === 'auth/wrong-password') errors.value.push('Incorrect password.')
                else if (error.code === 'auth/invalid-email') errors.value.push('Invalid email address.')
                else if (error.code === 'auth/too-many-requests') errors.value.push('Too many failed attempts. Please try again later.')
                else errors.value.push('Failed to sign in. Please try again.')
            } finally {
                loading.value = false
            }
        }

        const handleGoogleSignIn = async () => {
            errors.value = []
            loading.value = true
            try {
                const provider = new GoogleAuthProvider()
                const result = await signInWithPopup(auth, provider)
                const user = result.user

                // Check if user document exists, create if not
                const userDocRef = doc(db, 'users', user.uid)
                const userDoc = await getDoc(userDocRef)
                
                if (!userDoc.exists()) {
                    // Create user document for new Google sign-in
                    await setDoc(userDocRef, {
                        userSettings: {
                            name: user.displayName || '',
                            username: user.email?.split('@')[0] || '',
                            theme: 'system',
                            profilePictureUrl: user.photoURL || null
                        },
                        userStats: {
                            clothingCount: 0,
                            outfitCount: 0
                        },
                        userMeasurements: {},
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    })
                }

                await router.push('/app/outfits')
            } catch (error) {
                console.error('Google sign-in error:', error)
                if (error.code === 'auth/popup-closed-by-user') {
                    errors.value.push('Sign-in popup was closed.')
                } else if (error.code === 'auth/cancelled-popup-request') {
                    // User cancelled, no error needed
                } else {
                    errors.value.push('Failed to sign in with Google. Please try again.')
                }
            } finally {
                loading.value = false
            }
        }

        const goToSignUp = () => {
            router.push('/signup');
        }

        return {
            form,
            errors,
            loading,
            handleSubmit,
            handleGoogleSignIn,
            goToSignUp
        }
    }
}
</script>

<style scoped>
.login-card {
    border-radius: 0.75rem;
}
.splash {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>