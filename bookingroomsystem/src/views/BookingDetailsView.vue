<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const fileInput = ref(null);
const selectedFile = ref(null);

const route = useRoute();
const details = ref({
    bookingId: '',
    roomName: '',
    date: '',
    timeslots: [],
    status: '',
    paymentProof: null
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

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
  console.log('Selected file:', selectedFile.value);
};

const uploadPaymentProof = async () => {
    try {

        if (!selectedFile.value) {
            console.error('No file selected');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please log in.');
        }

        const formData = new FormData()
        // Object.keys(details.value).forEach(key => {
        //     if (key === 'paymentProof' && details.value[key]) {
        //         formData.append('paymentProof', details.value[key]);
        //     } else if (typeof details.value[key] === 'boolean') {
        //         formData.append(key, details.value[key].toString());
        //     } else if (details.value[key] !== null && details.value[key] !== undefined) {
        //         formData.append(key, details.value[key]);
        //     }
        // });

        formData.append('paymentProof', selectedFile.value)

        const response = await fetch(`/api/users/bookingHistory/${details.value.bookingId}/uploadPaymentProof`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload payment proof');
        }

        const data = await response.json();
        console.log('Payment proof uploaded successfully:', data);
        await fetchDetails();

    } catch (error) {
        console.error('Error uploading payment proof:', error.message);
    }
};

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
    <div class="row mt-3">
        <!-- Payment Proof Exist -->
        <div v-if = "details.paymentProof">
            <h5>Payment Proof:</h5>
            <img 
                v-if="details.paymentProof" 
                :src="details.paymentProof" 
                :alt="details.bookingId"
                @error="handleImageError"
                class="proof-img"
            />
        </div>

        <!-- No Payment Proof -->
        <div v-else>
            <form @submit.prevent="uploadPaymentProof">
            <div class="mb-3">
                <label>Upload Payment Proof:</label>
                <input 
                    type="file" 
                    @change="handleFileChange" 
                    accept="image/*" 
                    ref="fileInput"
                />
            </div>
            <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="!selectedFile"
            >
                Upload
            </button>
        </form>
        </div>
    </div>
</template>

<style scoped>
.proof-img {
    max-height: 300px;
    object-fit: contain;
}
</style>