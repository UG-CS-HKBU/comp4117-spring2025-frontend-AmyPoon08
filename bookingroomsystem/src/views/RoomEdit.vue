<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const roomId = route.params.id;  // Get roomId from URL
const selectedFile = ref(null);

const fileInput = ref(null);
const room = ref({
  room_number: '',
  name: '',
  type: '',
  category: '',
  capacity: '',
  participant: '',
  location: '',
  availability: true,
  under_maintenance: false,
  price: '',
  description: '',
  highlight: false,
  image: null,  // For new image uploads
  existingImage: '' // Stores the current image URL
});

// Fetch Room Details
const fetchRoomDetails = async () => {
  try {
    const response = await fetch(`/api/rooms/${roomId}`);
    if (!response.ok) throw new Error('Failed to fetch room data');
    
    const data = await response.json();
    room.value = { ...data, image: null }; // Keep existing image URL
    room.value.existingImage = data.image; // Save existing image
  } catch (error) {
    console.error('Error fetching room details:', error);
  }
};

// Handle Image Upload
const handleFileChange = async (event) => {
    selectedFile.value = event.target.files[0];
};

// Update Room
const updateRoom = async () => {
  try {

    if(!selectedFile.value){
        console.error('No file selected')
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found. Please log in.');

    const formData = new FormData();
    Object.keys(room.value).forEach(key => {
      if (key === 'image' && room.value[key]) {
        formData.append('image', room.value[key]);  // New image upload
      } else if (typeof room.value[key] === 'boolean') {
        formData.append(key, room.value[key].toString());
      } else if (room.value[key] !== null && room.value[key] !== undefined) {
        formData.append(key, room.value[key]);
      }
    });

    formData.append('image', selectedFile.value)

    const response = await fetch(`/api/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update room');
    }

    console.log('Room updated successfully');
    alert('Room updated successfully!');
    router.push('/rooms'); // Redirect after updating

  } catch (error) {
    console.error('Error updating room:', error.message);
  }
};

// Fetch existing room data when component is mounted
onMounted(fetchRoomDetails);
</script>

<template>
  <div>
    <h1>Edit Room</h1>
    <form @submit.prevent="updateRoom">
      <div>
        <label>Room Number:</label>
        <input v-model="room.room_number" required />
      </div>
      <div>
        <label>Name:</label>
        <input v-model="room.name" required />
      </div>
      <div>
        <label>Type:</label>
        <select v-model="room.type" required>
          <option value="Single Room">Single Room</option>
          <option value="Share Room">Share Room</option>
        </select>
      </div>
      <div>
        <label>Category:</label>
        <input v-model="room.category" required />
      </div>
      <div>
        <label>Capacity:</label>
        <input v-model="room.capacity" required />
      </div>
      <div>
        <label>Participant:</label>
        <input v-model="room.participant" required />
      </div>
      <div>
        <label>Location:</label>
        <input v-model="room.location" required />
      </div>
      <div>
        <label>Availability:</label>
        <input type="checkbox" v-model="room.availability" />
      </div>
      <div>
        <label>Under Maintenance:</label>
        <input type="checkbox" v-model="room.under_maintenance" />
      </div>
      <div>
        <label>Price:</label>
        <input v-model="room.price" required />
      </div>
      <div>
        <label>Current Room Image:</label>
        <img v-if="room.existingImage" :src="room.existingImage" alt="Current Room Image" width="150" />
      </div>
      <div>
        <label>Upload New Image:</label>
        <input type="file" @change="handleFileChange" accept="image/*" ref="fileInput" />
      </div>
      <div>
        <label>Description:</label>
        <textarea v-model="room.description" required></textarea>
      </div>
      <div>
        <label>Highlight:</label>
        <input type="checkbox" v-model="room.highlight" />
      </div>
      <button type="submit">Update Room</button>
    </form>
  </div>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: auto;
}

label {
  margin-top: 10px;
}

input,
select,
textarea {
  margin-bottom: 10px;
  padding: 5px;
  width: 100%;
}

button {
  margin-top: 10px;
  padding: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
