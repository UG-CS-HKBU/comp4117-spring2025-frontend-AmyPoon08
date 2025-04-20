<template>
  <div class="carousel-container">
    <h2 class="carousel-title">The Most popular Rooms</h2>

    <div class="rooms-grid">
      <div v-for="room in topRooms" :key="room._id" class="room-item">
        <img
          :src="room.roomDetails.imageUrl"
          alt="Room Image"
          class="room-image"
        />
        <div class="room-info">
          <h3>{{ room.roomDetails.name }}</h3>
          <p class="price">Price: {{ room.roomDetails.price }}</p>
          <p>Total Bookings: {{ room.bookingCount }}</p>
          <div class="buttons">
            <button class="details-btn" @click="viewDetails(room)">More Details</button>
            <button v-if="!isAdmin" class="book-btn" @click="bookRoom(room)">Book Now</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../config';

export default {
  data() {
    return {
      topRooms: [],
      isAdmin: false,
    };
  },
  mounted() {
    this.fetchTopRooms();
    this.checkAdminStatus();
  },
  methods: {
    async fetchTopRooms() {
      try {
        const res = await axios.get(`${config.apiBaseUrl}/rooms/top`);
        this.topRooms = res.data.topRooms;
      } catch (err) {
        console.error('Failed to load top rooms:', err);
      }
    },
    async checkAdminStatus() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        
        const res = await axios.get('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        this.isAdmin = localStorage.getItem('admin') === 'on';
      } catch (err) {
        console.error('Failed to check admin status:', err);
        this.isAdmin = false;
      }
    },
    viewDetails(room) {
      // Navigate to RoomDetails page with room ID as a parameter
      this.$router.push({ name: 'RoomDetails', params: { id: room.roomDetails._id } });
      console.log('Viewing details for room:', room.roomDetails._id);
    },
    bookRoom(room) {
      // Navigate to BookRoom page with room ID as a parameter
      this.$router.push({ name: 'RoomBooking', params: { id: room.roomDetails._id } });
      console.log('Booking room:', room.roomDetails._id);
    }
  },
};
</script>

<style scoped>
.carousel-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 20px;
}

.carousel-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.room-item {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.room-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.room-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
}

.room-info {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.room-info h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #333;
}

.price {
  font-weight: bold;
  margin: 0.5rem 0;
  color: #444;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
}

button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

button:hover {
  transform: translateY(-2px);
}

.details-btn {
  background-color: #3f65ff;
  color: #fff;
}

.details-btn:hover {
  background-color: #254EDB;
}

.book-btn {
  background-color: #00a316;
  color: #fff;
}

.book-btn:hover {
  background-color: #008512;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .carousel-container {
    padding: 15px;
  }
  
  .carousel-title {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }
  
  .room-image {
    height: 180px;
  }
}

@media (max-width: 768px) {
  .rooms-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .carousel-title {
    font-size: 1.6rem;
    margin-bottom: 20px;
  }
  
  .room-info h3 {
    font-size: 1.1rem;
  }
  
  .buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  button {
    width: 100%;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .rooms-grid {
    grid-template-columns: 1fr;
  }
  
  .carousel-title {
    font-size: 1.4rem;
    margin-bottom: 15px;
  }
  
  .room-item {
    padding: 0.8rem;
  }
  
  .room-image {
    height: 160px;
  }
  
  .room-info {
    margin-top: 0.7rem;
  }
  
  .room-info h3 {
    font-size: 1rem;
    margin-bottom: 0.3rem;
  }
  
  .price, .room-info p {
    font-size: 0.9rem;
    margin: 0.3rem 0;
  }
  
  .buttons {
    padding-top: 0.7rem;
  }
}

@media (max-width: 375px) {
  .carousel-container {
    padding: 10px;
  }
  
  .room-image {
    height: 140px;
  }
  
  button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>