<script setup>
import { ref, watch } from 'vue'
import { onMounted } from 'vue'

const searchQuery = ref('');

const bookingHistory = ref([]);

let searchDebounceTimeout;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
}

const getStartTime = (timeslots) => {
    if (!timeslots || timeslots.length === 0) return '-';
    return timeslots[0];
}

const getEndTime = (timeslots) => {
    if (!timeslots || timeslots.length === 0) return '-';
    return timeslots[timeslots.length - 1];
}

watch(searchQuery, (newQuery) => {
    // Add debounce to prevent too many API calls
    if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
    }
    searchDebounceTimeout = setTimeout(() => {
        const query = newQuery ? `?roomName=${encodeURIComponent(newQuery)}` : '';
        fetchBookingHistory(query);
    }, 10); // Wait 10ms after user stops typing
});

const fetchBookingHistory = async (query = '') => {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            throw new Error('No token found. Please log in.')
        }

        const response = await fetch(`/api/users/bookingHistory${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again.')
            } else if (response.status === 403) {
                throw new Error('Forbidden: Invalid token.')
            } else {
                throw new Error('Failed to fetch booking history. Server responded with status: ' + response.status)
            }
        }

        const data = await response.json()
        bookingHistory.value = data
        console.log('Booking history fetched successfully:', data)
    } catch (error) {
        console.error('Error fetching booking history:', error.message)
    }
}

onMounted(() => {
    fetchBookingHistory()
})
</script>

<template>
    <div>
        <h1>Booking Record</h1>
    </div>

    <div class="row mt-3">
        <div class="col-12">
            <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control" 
                placeholder="Search..."
            />
        </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-blue-500 text-black">
            <th class="p-3 text-left">NO.</th>
            <th class="p-3 text-left">Booking ID</th>
            <th class="p-3 text-left">Room Name</th>
            <th class="p-3 text-left">Date</th>
            <th class="p-3 text-left">Start Time</th>
            <th class="p-3 text-left">End Time</th>
            <th class="p-3 text-left">State</th>
            <th class="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(booking, index) in bookingHistory" 
              :key="booking.bookingId"
              class="border-b hover:bg-gray-100">
            <td class="p-3">{{ index + 1 }}</td>
            <td class="p-3">{{ booking.bookingId }}</td>
            <td class="p-3">{{ booking.roomName }}</td>
            <td class="p-3">{{ formatDate(booking.date) }}</td>
            <td class="p-3">{{ getStartTime(booking.timeslots) }}</td>
            <td class="p-3">{{ getEndTime(booking.timeslots) }}</td>
            <td class="p-3">{{ booking.status }}</td>
            <td class="p-3">
              <button class="bg-blue-500 px-4 py-1 rounded"
                      @click="viewBooking(booking.bookingId)">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
</template>