<template>
    <div class="carousel-container">
      <h2 class="carousel-title">Top 3 Most Booked Rooms</h2>
  
      <div class="carousel-wrapper">
        <div
          v-for="(room) in topRooms"
          :key="room._id"
          class="carousel-slide"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div class="room-item">
            <img
              :src="room.roomDetails.imageUrl"
              alt="Room Image"
              class="room-image"
            />
            <div class="room-info">
              <h3>{{ room.roomDetails.name }}</h3>
              <p>{{ room.roomDetails.description }}</p>
              <p class="price">Price: {{ room.roomDetails.price }}</p>
              <p>Total Bookings: {{ room.bookingCount }}</p>
              <div class="buttons">
                <button @click="viewDetails(room)">More Details</button>
                <button @click="bookRoom(room)">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div class="carousel-nav">
        <button @click="prevSlide">Prev</button>
        <button @click="nextSlide">Next</button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        topRooms: [],
        currentIndex: 0,
      };
    },
    mounted() {
      this.fetchTopRooms();
    },
    methods: {
      async fetchTopRooms() {
        try {
          const res = await axios.get('/api/rooms/top');
          this.topRooms = res.data;
        } catch (err) {
          console.error('Failed to load top rooms:', err);
        }
      },
      prevSlide() {
        this.currentIndex =
          (this.currentIndex - 1 + this.topRooms.length) % this.topRooms.length;
      },
      nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.topRooms.length;
      },
      viewDetails(room) {
        this.$router.push({ name: 'RoomDetailsView', params: { roomId: room._id } });
      },
      bookRoom(room) {
        this.$router.push({ name: 'BookView', params: { roomId: room._id } });
      },
    },
  };
  </script>
  
  <style scoped>
  .carousel-container {
    max-width: 960px;
    margin: 0 auto;
    text-align: center;
    padding: 2rem 1rem;
  }
  
  .carousel-title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
  }
  
  .carousel-wrapper {
    display: flex;
    transition: transform 0.5s ease-in-out;
    overflow: hidden;
    width: 100%;
  }
  
  .carousel-slide {
    min-width: 100%;
    box-sizing: border-box;
  }
  
  .room-item {
    background: #fff;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
  
  .room-image {
    max-width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .room-info {
    margin-top: 1rem;
  }
  
  .price {
    font-weight: bold;
    margin: 0.5rem 0;
  }
  
  .buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  button {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
    font-weight: 500;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .carousel-nav {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
    gap: 2rem;
  }
  </style>
  