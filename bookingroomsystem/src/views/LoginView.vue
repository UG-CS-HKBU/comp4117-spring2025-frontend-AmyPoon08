<script setup>
// imports
import { ref, inject, onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import config from '../config';

const router = useRouter();

// credentials
const credentials = ref({
    email: '',
    password: ''
});

const { isAuthenticated, hideNav } = inject('auth')
const showPassword = ref(false);
const errorMessage = ref(''); // Add a ref to store error messages

// Hide nav when component is mounted
onMounted(() => {
  hideNav()
});

onBeforeMount(() => {
  const token = localStorage.getItem('token');
  if (token) {
    router.push('/home');
  } 
});

// methods
const login = async () => {
    try {
        errorMessage.value = '';
        console.log('Attempting login to:', `${config.apiBaseUrl}/login`); // Add logging

        const response = await fetch(`${config.apiBaseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json' // Add this line
            },
            body: JSON.stringify(credentials.value)
        });

        // Add detailed error logging
        if (!response.ok) {
            console.error('Login failed:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });

            // Try to read error message
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message;
            } catch (e) {
                errorMessage = await response.text(); // Fallback to reading raw text
                console.log('Raw error response:', errorMessage);
            }

            throw new Error(errorMessage || 'Login failed');
        }

        const data = await response.json();
        console.log('Login response:', data);

        // Store token and userId
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        
        // Store admin status - using 'admin' instead of 'isAdmin'
        localStorage.setItem('admin', data.admin); // Changed from data.isAdmin to data.admin
        console.log('Admin status set to:', data.admin);

        isAuthenticated.value = true;
        await router.push('/home');
        
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.value = error.message || 'An unexpected error occurred';
    }
};

onMounted(() => {
    if (hideNav) {
        hideNav();
    }
});
</script>

<template>
    <main>
        <div class="container-fluid mt-5">
            <div class="card">
                <div class="card-body">
                    <form @submit.prevent="login">
                        <div class="mb-5">
                            <label for="email" class="form-label">Email: </label>
                            <input type="email" class="form-control" v-model="credentials.email" id="email"
                                aria-describedby="emailHelp" required>
                        </div>
                        <div class="mb-5">
                            <label for="password" class="form-label">Password: </label>
                            <div class="input-group">
                                <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="credentials.password" id="password" required>
                                <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
                                    {{ showPassword ? 'Hide' : 'Show' }}
                                </button>
                            </div>
                        </div>
                        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div> <!-- Display error message -->
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
main {
    background-image: url('@/images/login.png');
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
}

.card {
    width: 30%;
    background-color: rgba(255, 255, 255, 0.8);
    margin: 0 auto;
}

/* Responsive styles for mobile */
@media (max-width: 768px) {
    .card {
        width: 90%;
        max-width: 400px;
    }
    
    .container-fluid {
        padding: 0 15px;
    }
    
    .mb-5 {
        margin-bottom: 1.5rem !important;
    }
    
    .btn {
        width: 100%;
    }
}

/* Additional adjustments for very small screens */
@media (max-width: 320px) {
    .card {
        width: 95%;
    }
    
    .container-fluid {
        padding: 0 10px;
    }
    
    .card-body {
        padding: 1rem;
    }
    
    .form-label {
        font-size: 0.9rem;
    }
    
    .form-control, .btn {
        font-size: 0.9rem;
    }
}
</style>