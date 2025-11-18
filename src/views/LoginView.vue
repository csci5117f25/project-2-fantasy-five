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
                                />
                            </div>

                            <!-- Log In button -->
                            <button type="submit" class="btn btn-primary w-100">
                                Log In
                            </button>

                            <!-- Google Login -->
                            <button 
                            type="button" 
                            class="btn btn-danger w-100 mt-3"
                            @click="signInWithGoogle"
                            >
                            <i class="fab fa-google me-2"></i> Continue with Google
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
export default {
    name: 'LoginView',
    setup() {
        const router = useRouter()

        const form = ref({
            email : '',
            password: ''
        })

        const errors = ref([])

        const googleProvider = new GoogleAuthProvider();

        const signInWithGoogle = async () => {
        errors.value = [];

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Firestore user
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName || "",
                email: user.email,
                profilePic: user.photoURL || "",
                username: user.email.split("@")[0],
                createdAt: new Date(),
                provider: "google",
            });
            }

            router.push("/app/outfits");
        } catch (error) {
            console.error(error);
            errors.value.push(error.message);
        }
        };

        // manual user
        const handleSubmit = async () => {
            errors.value = []
            if (!form.value.email.trim()) 
                errors.value.push("Email is required.")

            if (!form.value.username.trim()) {
                errors.value.push('Username is required.')
            }

            if (!form.value.password) {
                errors.value.push('Password is required.')
            }

            if (errors.value.length > 0) {
                return
            }

            try {
                await signInWithEmailAndPassword(
                    auth,
                    form.value.email,
                    form.value.password
                )

                router.push("/app/outfits")

            } catch (error) {
                errors.value.push("Invalid email or password")
                console.error(error)
            }

        }

        const goToSignUp = () => {
            router.push('/signup');
        }

        return {
            form,
            errors,
            handleSubmit,
            goToSignUp,
            signInWithGoogle
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