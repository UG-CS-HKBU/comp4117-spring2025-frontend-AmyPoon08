<script setup>
import { RouterView } from 'vue-router'
import { ref, provide, onMounted } from 'vue'


const userName = ref('') 

const fetchName = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please log in.');
        }

        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Pass the token in the Authorization header
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again.');
            } else if (response.status === 403) {
                throw new Error('Forbidden: Invalid token.');
            } else if (response.status === 404) {
                throw new Error('User profile not found.');
            } else {
                throw new Error('Failed to fetch profile. Server responded with status: ' + response.status);
            }
        }

        const data = await response.json();
        userName.value = data; 
        console.log('userName fetched successfully:', data);
    } catch (error) {
        console.error('Error fetching profile:', error.message);
    }
};

//const showMenu = ref(false)
const showNav = ref(true) // New ref to control nav visibility

// const toggleMenu = () => {
//   showMenu.value = !showMenu.value
// }

const hideNav = () => {
  showNav.value = false
}

const showNavBar = () => {
  showNav.value = true
}

// Provide both functions to child components
provide('navControls', {
  hideNav,
  showNavBar
})

onMounted(() => {
    fetchName();
});
</script>

<template>
    <nav  v-if="showNav" class="menubar">
        <div class="left">
            <a href="/home" @click="goToHome">Room Booking System</a>
        </div>
        <div class="right">
            <span>{{ userName.username }}</span> 
            <br>
            <div class="dropdown">
                <button class="dropbtn"><span>&#9776;</span></button>
                <div class="dropdown-content">
                    <a href="/profile">Profile</a>
                    <a href="/Bookings">Bookings</a>
                    <a href="/BookingRecord">Booking Record</a>
                    <a href="/AboutUs">About us</a>
                    <a href="#" @click="logout">Logout</a>
                </div>
            </div>
        </div>
    </nav>
    <RouterView />
</template>

<style>
.menubar {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background-color: #333;
    color: white;
}

.menubar .left a {
    color: white;
    text-decoration: none;
    font-size: 20px;
}

.menubar .right {
    display: flex;
    align-items: center;
    margin-left: auto;
}

.menubar .right .dropdown {
    position: relative;
    display: inline-block;
}

.menubar .right .dropdown .dropbtn {
    background-color: #333;
    color: white;
    border: none;
    cursor: pointer;
    margin-left: 10px;
}

.menubar .right .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    right: 10px; 
}

.menubar .right .dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

.menubar .right .dropdown-content a:hover {
    background-color: #f1f1f1;
}

.menubar .right .dropdown:hover .dropdown-content {
    display: block;
}

.menubar .right .dropdown:hover .dropbtn {
    background-color: #555;
}
</style>