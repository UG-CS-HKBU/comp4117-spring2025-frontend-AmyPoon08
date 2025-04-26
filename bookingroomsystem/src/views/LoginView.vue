<script setup>
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
        <div class="login-container">
            <div class="card">
                <div class="card-header">
                    <h2>Welcome Back</h2>
                    <p>Please sign in to continue</p>
                </div>
                <div class="card-body">
                    <form @submit.prevent="login">
                        <div class="form-group">
                            <label for="email" class="form-label">Email</label>
                            <input 
                                type="email" 
                                class="form-control" 
                                v-model="credentials.email" 
                                id="email"
                                placeholder="Enter your email"
                                aria-describedby="emailHelp" 
                                required
                            >
                        </div>
                        <div class="form-group">
                            <label for="password" class="form-label">Password</label>
                            <div class="password-input-group">
                                <input 
                                    :type="showPassword ? 'text' : 'password'" 
                                    class="form-control" 
                                    v-model="credentials.password" 
                                    id="password" 
                                    placeholder="Enter your password"
                                    required
                                >
                                <button 
                                    type="button" 
                                    class="password-toggle-btn" 
                                    @click="showPassword = !showPassword"
                                >
                                    {{ showPassword ? 'Hide' : 'Show' }}
                                </button>
                            </div>
                        </div>
                        <div v-if="errorMessage" class="error-message">
                            <i class="error-icon">!</i> {{ errorMessage }}
                        </div>
                        <button type="submit" class="login-btn">Login</button>
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
    background-repeat: no-repeat;
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.login-container {
    width: 100%;
    max-width: 450px;
    margin: 0 auto;
}

.card {
    width: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

.card-header {
    padding: 25px 30px 15px;
    background-color: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    text-align: center;
}

.card-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.8rem;
    font-weight: 600;
}

.card-header p {
    margin-top: 8px;
    color: #7f8c8d;
    font-size: 1rem;
}

.card-body {
    padding: 30px;
}

.form-group {
    margin-bottom: 25px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #2c3e50;
    font-size: 0.95rem;
}

.form-control {
    width: 100%;
    padding: 12px 15px;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: #fff;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.password-input-group {
    position: relative;
    display: flex;
}

.password-input-group input {
    flex: 1;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.password-toggle-btn {
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-left: none;
    padding: 0 15px;
    font-size: 0.9rem;
    color: #6c757d;
    cursor: pointer;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    transition: background-color 0.2s;
}

.password-toggle-btn:hover {
    background-color: #e9ecef;
}

.error-message {
    background-color: #ffeeee;
    color: #e74c3c;
    padding: 12px 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    font-size: 0.95rem;
}

.error-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background-color: #e74c3c;
    color: white;
    border-radius: 50%;
    margin-right: 10px;
    font-style: normal;
    font-weight: bold;
    font-size: 0.8rem;
}

.login-btn {
    width: 100%;
    background-color: #3498db;
    color: white;
    border: none;
    padding: 14px;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
}

.login-btn:hover {
    background-color: #2980b9;
}

.login-btn:active {
    transform: scale(0.98);
}

/* Responsive styles */
@media (max-width: 768px) {
    .login-container {
        max-width: 90%;
    }
    
    .card-header h2 {
        font-size: 1.6rem;
    }
    
    .card-body {
        padding: 20px;
    }
}

@media (max-width: 480px) {
    main {
        padding: 15px;
        align-items: flex-start;
        padding-top: 10vh;
    }
    
    .card {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
        padding: 20px 20px 10px;
    }
    
    .card-header h2 {
        font-size: 1.4rem;
    }
    
    .card-header p {
        font-size: 0.9rem;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-control {
        padding: 10px 12px;
        font-size: 0.95rem;
    }
    
    .login-btn {
        padding: 12px;
    }
}

/* For very small screens */
@media (max-width: 320px) {
    .card-body {
        padding: 15px;
    }
    
    .password-toggle-btn {
        padding: 0 10px;
        font-size: 0.8rem;
    }
}
</style>