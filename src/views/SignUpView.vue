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
                        <h1 class="h4 mb-4 text-center">Sign Up</h1>

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

                            <!-- Name -->
                            <div class="mb-3">
                                <label for="name" class="form-label">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    class="form-control"
                                    v-model="form.name"
                                    required
                                />
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

                            <!-- Username -->
                            <div class="mb-3">
                                <label for="username" class="form-label">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    class="form-control"
                                    v-model="form.username"
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
                                    minlength="8"
                                />
                                <div class="form-text">
                                    Must be at least 8 characters.
                                </div>
                            </div>

                            <!-- Confirm Password -->
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    class="form-control"
                                    v-model="form.confirmPassword"
                                    required
                                    minlength="8"
                                />
                            </div>

                            <!-- Profile Picture -->
                            <div class="mb-3">
                                <label for="profilePicture" class="form-label">
                                    Profile Picture <span class="text-muted">(optional)</span>
                                </label>
                                <input
                                    id="profilePicture"
                                    type="file"
                                    class="form-control"
                                    accept="image/*"
                                    @change="handleFileChange"
                                />
                            </div>

                            <!-- Submit -->
                            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                                {{ loading ? 'Creating Account...' : 'Create Account' }}
                            </button>

                            <!-- Divider -->
                            <div class="my-3 text-center">
                                <span class="text-muted">or</span>
                            </div>

                            <!-- Google Sign Up button -->
                            <button type="button" class="btn btn-outline-secondary w-100" @click="handleGoogleSignUp" :disabled="loading">
                                <i class="fab fa-google me-2"></i>
                                Continue with Google
                            </button>

                            <div class="mt-3 text-center">
                                <span>Already Signed Up?</span>
                                <button
                                    type="button"
                                    class="btn btn-link p-0 ms-1 align-baseline"
                                    @click="goToLogin"
                                >
                                    Log In
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>

  <!-- Alert Modal -->
  <AlertModal v-model:show="showAlert" :message="alertMessage" />
</template>

<script>
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import AlertModal from '@/components/AlertModal.vue'

export default {
    name: "SignUpView",
    components: {
        AlertModal
    },
    data() {
        return {
            form: {
                name: "",
                email: "",
                username: "",
                password: "",
                confirmPassword: "",
                profilePicture: null
            },
            errors: [],
            loading: false,
            showAlert: false,
            alertMessage: ''
        };
    },
    methods: {
        // profile pic
        handleFileChange(event) {
            const files = event.target.files;
            if (files && files.length > 0) {
                this.form.profilePicture = files[0];
            } else {
                this.form.profilePicture = null;
            }
        },
        // check account submission
        handleSubmit() {
            this.errors = [];

            if (!this.form.name.trim()) {
                this.errors.push("Name is required.");
            }
            if (!this.form.email.trim()) {
                this.errors.push("Email is required.");
            }
            if (!this.form.username.trim()) {
                this.errors.push("Username is required.");
            }
            if (!this.form.password.trim()) {
                this.errors.push("Password is required.");
            }
            if (!this.form.confirmPassword.trim()) {
                this.errors.push("Confirm Password is required.");
            }

            if (this.form.password && this.form.confirmPassword
                && this.form.password !== this.form.confirmPassword) {
                this.errors.push("Passwords do not match.");
            }
            
            if (this.errors.length > 0) {
                return;
            }

            // all inputs valid
            // now build data to send to server
            const formData = new FormData();
            formData.append("name", this.form.name);
            formData.append("username", this.form.username);
            formData.append("password", this.form.password);
            if (this.form.profilePicture) {
                formData.append("profilePicture", this.form.profilePicture);
            }

            // reset form
            this.form.name = "";
            this.form.username = "";
            this.form.password = "";
            this.form.confirmPassword = "";
            this.form.profilePicture = null;

            const fileInput = document.getElementById("profilePicture");
            if (fileInput) {
                fileInput.value = "";
            }

            this.showAlertModal("all inputs valid; account data ready to send to server");
        },
        goToLogin() {
           this.$router.push('/login')
        },
        showAlertModal(message) {
            this.alertMessage = message
            this.showAlert = true
        },
        async handleGoogleSignUp() {
            this.errors = []
            this.loading = true
            try {
                const provider = new GoogleAuthProvider()
                const result = await signInWithPopup(auth, provider)
                const user = result.user

                // Check if user document exists, create if not
                const userDocRef = doc(db, 'users', user.uid)
                const userDoc = await getDoc(userDocRef)
                
                if (!userDoc.exists()) {
                    // Create user document for new Google sign-up
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

                await this.$router.push('/app/outfits')
            } catch (error) {
                console.error('Google sign-up error:', error)
                if (error.code === 'auth/popup-closed-by-user') {
                    this.errors.push('Sign-up popup was closed.')
                } else if (error.code === 'auth/cancelled-popup-request') {
                    // User cancelled, no error needed
                } else {
                    this.errors.push('Failed to sign up with Google. Please try again.')
                }
            } finally {
                this.loading = false
            }
        }
    }
};
</script>

<style scoped>
.splash {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>