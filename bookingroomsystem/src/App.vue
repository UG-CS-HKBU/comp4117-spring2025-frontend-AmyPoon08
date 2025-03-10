<script setup>
import { RouterView } from 'vue-router'
import { ref } from 'vue'

const userName = ref('Demo User') // Replace with actual user data

function goToHome() {
    // Logic to navigate to home page
}

function logout() {
    // Logic to handle logout
}
</script>

<template>
    <nav class="menubar">
        <div class="left">
            <a href="#" @click="goToHome">Room Booking System</a>
        </div>
        <div class="right">
            <span>{{ userName }}</span>
            <br>
            <div class="dropdown">
                <button class="dropbtn"><span>&#9776;</span></button>
                <div class="dropdown-content">
                    <a href="#">Profile</a>
                    <a href="#">Bookings</a>
                    <a href="#">Booking Record</a>
                    <a href="#">About us</a>
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
