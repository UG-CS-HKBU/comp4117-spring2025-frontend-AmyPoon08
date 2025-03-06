<script setup>
// imports
import { ref } from 'vue';

// credentials
const credentials = ref({
    email: '',
    password: ''
});

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

        // response
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        // save token to local storage
        localStorage.setItem('token', data.token);
        window.location.href = '/';
    } catch (error) {
        alert(error);
    }
}
</script>


<template>
    <main>
        <div class="container-fluid mt-5">
            <div class="card" style="width: 30rem;">
                <div class="card-body" style="width: 30rem;">
                    <h5 class="card-title" >Login</h5>
                    <form @submit.prevent="login">
                        <div class="mb-5">
                            <label for="email" class="form-label">Email: </label>
                            <input type="email" class="form-control" v-model="credentials.email" id="email"
                                aria-describedby="emailHelp" >
                        </div>
                        <div class="mb-5">
                            <label for="password" class="form-label">Password: </label>
                            <input type="password"  class="form-control" v-model="credentials.password" id="password">
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
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>