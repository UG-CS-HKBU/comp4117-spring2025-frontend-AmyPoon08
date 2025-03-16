<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const details = ref({
    bookingId: '',
    roomName: '',
    date: '',
    timeslots: [],
    status: ''
});


const fetchDetails = async () => {
    try {
        const bookingId = route.params.id;

        if(bookingId) {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No token found. Please log in.')
            }

            const response = await fetch(`/api/users/bookingHistory/${bookingId}`, {
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
            details.value = data
            console.log('Booking history fetched successfully:', data)
        }
    } catch (error) {
        console.error('Error fetching booking history:', error.message)
    }
}

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

onMounted(() => {
    fetchDetails();
})
</script>

<template>
    <div row="row mt-3">
        <h1>Booking Details</h1>
    </div>

    <div class="row mt-3">
        <div>
            Booking ID: {{ details.bookingId }}
        </div>
        <div>
            Name: {{ details.roomName }}
        </div>
        <div>
            Date: {{ formatDate(details.date) }}
        </div>
        <div>
            Start Time: {{ getStartTime(details.timeslots) }}
        </div>
        <div>
            End Time: {{ getEndTime(details.timeslots) }}
        </div>
        <div>
            State: {{ details.status }}
        </div>
    </div>
</template>