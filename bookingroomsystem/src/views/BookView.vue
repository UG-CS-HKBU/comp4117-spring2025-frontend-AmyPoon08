<script setup>
import { ref, onMounted, computed} from 'vue';
import { useRoute} from "vue-router";

const route = useRoute();

const room = ref({
  _id: null,
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
  sasUrl: '',
  highlight: false,
});

const fetchRoom = async () => {
    try {
        // Check if there's an ID in the route params
        if (route.params.id) {
            const response = await fetch(`/api/rooms/${route.params.id}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            
            const data = await response.json();
            console.log(data);
            
            room.value = {
                ...data, 
            };
        }
    } catch (err) {
        console.error('Failed to fetch room data:', err);
    }
};

const selectedDate = ref('');
const selectedTimeSlots = ref([]);
const isAllDaySelected = ref(false);

const timeSlots = computed(() => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    const nextHour = ((i + 1) % 24).toString().padStart(2, '0');
    const time = `${hour}:00`;
    const label = `${hour}:00 - ${nextHour}:00`;
    slots.push({ time, label });
  }
  return slots;
});

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const hasSelectedSlots = computed(() => {
  return selectedTimeSlots.value.length > 0 || isAllDaySelected.value;
});

const clearSelection = () => {
  selectedTimeSlots.value = [];
  isAllDaySelected.value = false;
};


const toggleTimeSlot = (time) => {
  const index = selectedTimeSlots.value.indexOf(time);
  if (index === -1) {
    selectedTimeSlots.value.push(time);
  } else {
    selectedTimeSlots.value.splice(index, 1);
  }
};

const toggleAllDay = () => {
  isAllDaySelected.value = !isAllDaySelected.value;
  if (isAllDaySelected.value) {
    selectedTimeSlots.value = timeSlots.value.map(slot => slot.time);
  } else {
    selectedTimeSlots.value = [];
  }
};

const isValidBooking = computed(() => {
  return selectedTimeSlots.value.length > 0;
});

const calculateTotal = () => {
  if (isAllDaySelected.value) {
    return room.value.price * 24; // Full day price
  }
  return selectedTimeSlots.value.length * room.value.price; // Price per selected timeslot
};

const bookRoom = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    const response = await fetch(`/api/rooms/${room.value._id}/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        date: selectedDate.value,
        timeslots: selectedTimeSlots.value
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to book room');
    }

    const data = await response.json();
    console.log('Room booked successfully:', data);

    // Reset the form
    selectedDate.value = '';
    selectedTimeSlots.value = [];
    isAllDaySelected.value = false;

  } catch (error) {
    console.error('Error booking room:', error.message);
  }
};

onMounted(() => {
    fetchRoom();
});

</script>

<template>
    <div>
        <h1>Book Room</h1>
        <div class="row">
            <div class="col-md-6">
                <div class="image-container">
                    <img 
                        v-if="room.imageUrl || room.sasUrl" 
                        :src="room.imageUrl || room.sasUrl" 
                        :alt="room.name"
                        class="room-image"
                        @error="handleImageError"
                    />
                </div>
            </div>
            <div class="col-md-6">
                <h1 class="card-title font-weight-bold">{{ room.name }}</h1>
                <h3 class="card-text">{{ room.description }}</h3>

                <!-- Select Date -->
                <div class="d-flex align-items-center">
                    <input 
                        type="date" 
                        class="form-control" 
                        v-model="selectedDate"
                        :min="getCurrentDate()"
                    />
                </div>

                <!-- Select Timeslot -->
                <div v-if="selectedDate" class="timeslots-container">
                    <div class="mb-4">
                        <button 
                        class="all-day-btn"
                        :class="{ 'selected': isAllDaySelected }"
                        @click="toggleAllDay"
                        >
                        All Day
                        </button>
                    </div>

                    <!-- Clear Selection -->
                    <button 
                        class="clear-btn"
                        @click="clearSelection"
                        :disabled="!hasSelectedSlots"
                        >
                        Clear Selection
                    </button>

                    <div class="timeslots-grid">
                        <button
                        v-for="slot in timeSlots"
                        :key="slot.time"
                        class="time-slot"
                        :class="{ 
                            'selected': selectedTimeSlots.includes(slot.time),
                            'disabled': isAllDaySelected
                        }"
                        @click="toggleTimeSlot(slot.time)"
                        :disabled="isAllDaySelected"
                        >
                        {{ slot.label }}
                        </button>
                    </div>

                    <!-- Total Price -->
                    <div v-if="selectedDate" class="total-price mt-6">
                        <span class="text-xl font-bold">
                            Total: HKD {{ calculateTotal() }}
                        </span>
                    </div>

                    <button class="book-now-btn" :disabled="!isValidBooking" @click="bookRoom">
                        Book Now
                    </button>
                    
                </div>

            </div>
        </div>
        

    </div>
</template>

<style scoped>
.image-container {
  width: 100%;
  height: 0;
  padding-bottom: 75%; /* Adjust this value to maintain aspect ratio */
  position: relative;
}

.room-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
