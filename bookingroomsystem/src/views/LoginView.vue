<script setup>
// imports
import { ref, inject, onMounted } from 'vue';

// credentials
const credentials = ref({
    email: '',
    password: ''
});

const { hideNav } = inject('navControls')

// Hide nav when component is mounted
onMounted(() => {
  hideNav()
})


// methods
const login = async () => {
    try {
        // fetch
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials.value)
        });


        console.log('Response:', response);
        console.log('Response Text:', await response.clone().text());

        // response
        if (response.status === 204 || response.headers.get('Content-Length') === '0') {
          throw new Error('Empty response from server');
        }
    
        const data = await response.json();

        if (!response.ok) {
            console.log("login failed");
            throw new Error(data.message);
        }

        // save token to local storage
        localStorage.setItem('token', data.token);
        window.location.href = '/';
    } catch (error) {
        alert(error);
    }
}

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
                <div class="card-body" >
                    <h5 class="card-title" >Login</h5>
                    <form @submit.prevent="login">
                        <div class="mb-5">
                            <label for="email" class="form-label">Email: </label>
                            <input type="email" class="form-control" v-model="credentials.email" id="email"
                                aria-describedby="emailHelp" required>
                        </div>
                        <div class="mb-5">
                            <label for="password" class="form-label">Password: </label>
                            <input type="password"  class="form-control" v-model="credentials.password" id="password" required>
                        </div>
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
    width: 50%;
    background-color: rgba(255, 255, 255, 0.8);
    margin: 0 auto;
}
</style>