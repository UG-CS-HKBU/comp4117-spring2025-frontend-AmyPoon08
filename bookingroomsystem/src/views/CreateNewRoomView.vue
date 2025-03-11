<script setup>
import { ref } from 'vue';

const initialRoomState = {
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
  image: null
};

const room = ref({ ...initialRoomState });

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    room.value.image = file;
    console.log('Selected file:', file);
  }
};

const createRoom = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    const formData = new FormData();
    for (const key in room.value) {
      formData.append(key, room.value[key]);
    }

    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    const data = await response.json();
    console.log('Room created successfully:', data);

    // Reset the form
    room.value = { ...initialRoomState };
  } catch (error) {
    console.error('Error creating room:', error.message);
  }
};
</script>

<template>
  <div>
    <h1>Create New Room</h1>
    <form @submit.prevent="createRoom">
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
        <label>Room Image:</label>
        <input type="file" @change="handleFileChange" />
      </div>
      <div>
        <label>Description:</label>
        <textarea v-model="room.description" required></textarea>
      </div>
      <div>
        <label>Highlight:</label>
        <input type="checkbox" v-model="room.highlight" />
      </div>
      <button type="submit">Create Room</button>
    </form>
  </div>
</template>

