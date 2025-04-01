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
      viewDetails(room) {
        // Navigate to RoomDetails page with room ID as a parameter
        this.$router.push({ name: 'room-details', params: { id: room.roomDetails._id } });
      },
      bookRoom(room) {
        // Navigate to BookRoom page with room ID as a parameter
        this.$router.push({ name: 'book-room', params: { roomId: room.roomDetails._id } });
      },
      prevSlide() {
        if (this.currentIndex > 0) {
          this.currentIndex--;
        }
      },
      nextSlide() {
        if (this.currentIndex < this.topRooms.length - 1) {
          this.currentIndex++;
        }
      }
    },
  };
  </script>
  
  <style scoped>
  .carousel-container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    padding: 3px;
  }
  
  .carousel-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .carousel-wrapper {
    display: flex;
    transition: transform 0.5s ease-in-out;
    overflow: hidden;
    width: 100%;
  }
  
  .carousel-slide {
    width: 100%;
    box-sizing: border-box;
  }
  
  .room-item {
    background: #fff;
    padding: 1rem;
    border-radius: 2px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
  
  .room-image {
    max-width: 80%;
    height: auto;
    object-fit: cover;
    border-radius: 2px;
  }
  
  .room-info {
    margin-top: 0.5rem;
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
    margin-top: 10px;
  }
  
  .carousel-nav button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .carousel-nav button:hover {
    background-color: #0056b3;
  }
  </style>
  