<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Select from 'primevue/select';

const fileInput = ref(null);
const selectedFile = ref(null);
const route = useRoute();
const router = useRouter();
const isAdmin = computed(() => localStorage.getItem('admin') === 'on');


const details = ref({
    bookingId: '',
    roomName: '',
    date: '',
    timeslots: [],
    status: '',
    paymentProof: null,
    totalPrice: 0
});

const fetchDetails = async () => {
    try {
        const bookingId = route.params.id;

        if(bookingId) {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No token found. Please log in.')
            }

            // Use different endpoints based on user role
            const endpoint = isAdmin.value 
                ? `/api/bookings/${bookingId}`
                : `/api/users/bookingHistory/${bookingId}`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in again.')
                } else if (response.status === 403) {
                    throw new Error('Forbidden: Invalid token.')
                } else {
                    throw new Error('Failed to fetch booking details. Server responded with status: ' + response.status)
                }
            }

            const data = await response.json();
            
            // Transform the data to match the expected format
            details.value = isAdmin.value ? {
                bookingId: data._id,
                roomName: data.roomName,
                date: data.date,
                timeslots: data.timeslots,
                status: data.status,
                paymentProof: data.paymentProof,
                totalPrice: data.totalPrice
            } : data;

            selectedStatus.value = data.status;
            console.log('Fetched booking details:', data);
        }
    } catch (error) {
        console.error('Error fetching booking details:', error.message)
    }
}

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
}

// const getStartTime = (timeslots) => {
//     if (!timeslots || timeslots.length === 0) return '-';
//     return timeslots[0];
// }

// const getEndTime = (timeslots) => {
//     if (!timeslots || timeslots.length === 0) return '-';
    
//     const startTime = timeslots[timeslots.length - 1]; // Get the last timeslot
//     const [hour, minute] = startTime.split(':').map(Number); // Split the time into hour and minute
//     const endTime = new Date();
//     endTime.setHours(hour, minute + 59); // Add 59 minutes to the start time

//     return endTime.toTimeString().slice(0, 5); // Format as HH:MM
// }

const getStartTime = (timeslots) => {
    if (!timeslots || timeslots.length === 0) return '-';
    // Sort timeslots chronologically
    const sortedSlots = [...timeslots].sort((a, b) => {
        const [hourA] = a.split(':').map(Number);
        const [hourB] = b.split(':').map(Number);
        return hourA - hourB;
    });
    return sortedSlots[0];
}

const getEndTime = (timeslots) => {
    if (!timeslots || timeslots.length === 0) return '-';
    
    // Sort timeslots chronologically
    const sortedSlots = [...timeslots].sort((a, b) => {
        const [hourA] = a.split(':').map(Number);
        const [hourB] = b.split(':').map(Number);
        return hourA - hourB;
    });
    
    const startTime = sortedSlots[sortedSlots.length - 1]; // Get the last timeslot
    const [hour, minute] = startTime.split(':').map(Number); // Split the time into hour and minute
    const endTime = new Date();
    endTime.setHours(hour, minute + 59); // Add 59 minutes to the start time

    return endTime.toTimeString().slice(0, 5); // Format as HH:MM
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

const selectedStatus = ref(null);
const statusOptions = [
    { label: 'Pending Payment', value: 'pending payment' },
    { label: 'Pending Approval', value: 'Pending approval' },
    { label: 'Confirmed', value: 'confirmed' }
];

const updateStatus = async () => {
    try{
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please log in.');
        }

        const response = await fetch(`/api/bookings/${route.params.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: selectedStatus.value })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again.');
            } else if (response.status === 403) {
                throw new Error('Forbidden: Invalid token.');
            } else {
                throw new Error('Failed to save user. Server responded with status: ' + response.status);
            }
        }

        const data = await response.json();
        details.value.status = data.status; 
        selectedStatus.value = data.status;
    } catch (error) {
        console.error('Error updating status:', error.message);
    }
}

onMounted(() => {
    fetchDetails();    
})


</script>

<template>
    <div class="header mt-3">
        <h1>Booking Details</h1>
    </div>

    <div class="details mt-3">
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

        <div v-if="isAdmin">
            <form @submit.prevent="updateStatus" class="flex gap-3 items-center"> 
                <div>Status: </div>
                <Select
                    v-model="selectedStatus"
                    :options="statusOptions"
                    :placeholder="details.status || 'Select a Status'"
                    class="w-full md:w-14rem"
                    optionLabel="label"
                    optionValue="value"
                />
                <Button 
                    type="submit" 
                    label="Update Status"
                    severity="success"
                />
            </form>
        </div>
        <div v-else>
            Status: {{ details.status }}
        </div>
    </div>
    <div class="payment-proof row mt-3">
        <!-- Payment Proof Exist -->
        <div v-if = "details.paymentProof">
            <div class="payment-header">Payment Proof:</div>
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
                <div class="payment-header">Upload Payment Proof:</div>
                <input 
                    type="file" 
                    @change="handleFileChange" 
                    accept="image/*" 
                    ref="fileInput"
                    class="file-picker"
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

    <div style="display: flex; justify-content: flex-end;">
        <Button type="button" label="Back" class="btn-back p-button-primary" @click="router.go(-1)" />
    </div>
    
</template>

<style scoped>
.proof-img {
    max-height: 300px;
    padding:30px;
}

.header{
    padding: 30px;
    font-size: 70px;
    font-weight: bold;
    padding-bottom: 60px;
}

.details{
    padding: 30px;
    font-size: 25px;
    row-gap: 15px;
}

.payment-header{
    padding: 30px;
    font-size: 25px;
    font-weight: bold;
}

.file-picker{
    padding: 30px;
}

.btn {
    padding: 12px 24px;
    margin-left:30px;
    font-size: 20px;
    font-weight: bold;
    color: white;
    background-color: #28a745;
    border-color: #196b2b;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    min-width: 120px;
}

.btn:hover {
    background-color: #196b2b; 
    transform: scale(1.05); 
}

.btn:disabled {
    background-color: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
}
</style>