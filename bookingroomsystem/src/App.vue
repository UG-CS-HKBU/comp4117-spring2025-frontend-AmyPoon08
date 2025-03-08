<script setup>
import { RouterView } from 'vue-router'
import { ref } from 'vue'

const userName = ref('User Name') // Replace with actual user name logic
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}
</script>

<template>
  <nav>
    <ul>
      <li><a href="#home">BookingRoomSystem</a></li>
      <li style="float: right; position: relative;">
        <a href="#more-options" @click.prevent="toggleMenu">&#9776;</a>
        <ul :style="{ display: showMenu ? 'block' : 'none', position: 'absolute', right: '0', backgroundColor: '#333', listStyleType: 'none', padding: '0', margin: '0' }">
          <li><a href="#profile">Profile</a></li>
          <li><a href="#bookings">Bookings</a></li>
          <li><a href="#booking-record">Booking Record</a></li>
          <li><a href="#about-us">About us</a></li>
          <li><a href="#logout">Logout</a></li>
        </ul>
      </li>
      <li style="float: right;"><span>{{ userName }}</span></li>
    </ul>
  </nav>
  <router-view />
</template>

<style scoped>
nav {
  background-color: #333;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0; 
  width: 100%;
  z-index: 1000; 
}

nav ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

nav ul li {
  float: left;
}

nav ul li a, nav ul li span {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

nav ul li a:hover, nav ul li span:hover {
  background-color: #111;
}
</style>