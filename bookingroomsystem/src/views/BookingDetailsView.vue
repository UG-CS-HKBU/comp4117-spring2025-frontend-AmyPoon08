<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Select from 'primevue/select';
import config from '../config';

const fileInput = ref(null);
const selectedFile = ref(null);
const route = useRoute();
const router = useRouter();
const isAdmin = computed(() => localStorage.getItem('admin') === 'on');
const isLoading = ref(true);

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
        isLoading.value = true;
        const bookingId = route.params.id;

        if (!bookingId) {
            throw new Error('No booking ID provided');
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please log in.');
        }

        // Always use the same endpoint for fetching booking details
        const response = await fetch(`${config.apiBaseUrl}/bookings/${bookingId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again.');
            } else if (response.status === 403) {
                throw new Error('Forbidden: You do not have permission to view this booking.');
            } else {
                throw new Error('Failed to fetch booking details');
            }
        }

        const data = await response.json();
        
        // Transform the data consistently for both admin and normal users
        details.value = {
            bookingId: data._id,
            roomId: data.roomId,
            roomName: data.roomName,
            roomNumber: data.roomNumber,
            date: data.date,
            timeslots: data.timeslots,
            status: data.status,
            paymentProof: data.paymentProof,
            totalPrice: data.totalPrice,
            participant: data.participant,
            userId: data.userId,
            username: data.username,
            userContact: data.userContact,
            userEmail: data.userEmail
        };

        selectedStatus.value = data.status;
        console.log('Fetched booking details:', data);

    } catch (error) {
        console.error('Error fetching booking details:', error);
        router.push('/bookings'); // Redirect to bookings page on error
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
}

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

const formatPrice = (price) => {
    return new Intl.NumberFormat('en-HK', {
        style: 'currency',
        currency: 'HKD'
    }).format(price);
}

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
  console.log('Selected file:', selectedFile.value);
};

const handleImageError = (event) => {
    event.target.src = '/placeholder-image.png'; // Replace with your placeholder image
    event.target.classList.add('image-error');
}

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

        const response = await fetch(`${config.apiBaseUrl}/users/bookingHistory/${details.value.bookingId}/uploadPaymentProof`, {
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
        selectedFile.value = null;
        if (fileInput.value) fileInput.value.value = '';

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

        const response = await fetch(`${config.apiBaseUrl}/bookings/${route.params.id}`, {
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

const canReturnToPayment = computed(() => {
    // Get current user's ID from localStorage or wherever you store it
    const currentUserId = localStorage.getItem('userId');
    
    return (
        details.value.status === 'pending payment' && 
        details.value.userId && 
        currentUserId && 
        details.value.userId.toString() === currentUserId.toString()
    );
});

const canUploadPaymentProof = computed(() => {
    const currentUserId = localStorage.getItem('userId');
    
    // If you need to compare ObjectIds, convert both to strings
    const bookingUserId = details.value.userId?.toString();
    const currentUserIdString = currentUserId?.toString();
    
    return (
        details.value.status === 'pending payment' && 
        bookingUserId && 
        currentUserIdString && 
        bookingUserId === currentUserIdString 
    );
});

const hasPaymentProof = computed(() => {
    return !!details.value.paymentProof;
});

const returnToPayment = () => {
    try {
        const bookingId = details.value.bookingId; // Using bookingId from details
        if (!bookingId) {
            throw new Error('Booking ID not found');
        }

        const timerKey = `booking_timer_${bookingId}`;
        
        // Check if this specific booking has expired
        const bookingTime = localStorage.getItem(timerKey);
        if (!bookingTime) {
            // If no timer exists, set a new one
            localStorage.setItem(timerKey, Date.now().toString());
        } else {
            // Check if existing timer has expired
            const elapsedSeconds = Math.floor((Date.now() - parseInt(bookingTime)) / 1000);
            if (elapsedSeconds >= 900) { // 15 minutes
                alert('Payment session has expired. Please make a new booking.');
                // Clean up expired booking data
                localStorage.removeItem(`pending_booking_${bookingId}`);
                localStorage.removeItem(timerKey);
                router.push('/rooms');
                return;
            }
        }

        // Store the current booking details
        localStorage.setItem(`pending_booking_${bookingId}`, JSON.stringify({
            bookingId: details.value.bookingId,
            roomId: details.value.roomId,
            roomName: details.value.roomName,
            roomNumber: details.value.roomNumber,
            date: details.value.date,
            timeslots: details.value.timeslots,
            participant: details.value.participant, // Added participant
            totalPrice: details.value.totalPrice,
            userId: details.value.userId,
            username: details.value.username,
            userContact: details.value.userContact,
            userEmail: details.value.userEmail,
            status: 'pending payment'
        }));
        
        // Navigate to payment page with booking ID
        router.push(`/payment/${bookingId}`);

    } catch (error) {
        console.error('Error returning to payment:', error);
        alert('Failed to return to payment page. Please try again.');
    }
};

const currentStep = computed(() => {
    if (!details.value.status) return '';
    return details.value.status.toLowerCase().replace(' ', '-');
});

const isStepCompleted = (step) => {
    const status = details.value.status?.toLowerCase() || '';
    
    switch(status) {
        case 'pending approval':
            return step === 'pending payment';
        case 'confirmed':
            return step === 'pending payment' || step === 'pending approval';
        default:
            return false;
    }
};

onMounted(() => {
    fetchDetails();    
})
</script>

<template>
    <div class="booking-details-container">
        <div class="booking-header">
            <h1>Booking Details</h1>
            <div class="booking-id">ID: {{ details.bookingId }}</div>
        </div>

        <!-- Progress Stepper - Colors unchanged -->
        <div class="progress-section">
            <div class="stepper-wrapper">
                <div 
                    class="stepper-item"
                    :class="{
                        'completed': isStepCompleted('pending payment'),
                        'active': currentStep === 'pending-payment'
                    }"
                >
                    <div class="step-counter">1</div>
                    <div class="step-name">Pending Payment</div>
                </div>
                <div 
                    class="stepper-item"
                    :class="{
                        'completed': isStepCompleted('pending approval'),
                        'active': currentStep === 'pending-approval'
                    }"
                >
                    <div class="step-counter">2</div>
                    <div class="step-name">Pending Approval</div>
                </div>
                <div 
                    class="stepper-item"
                    :class="{
                        'completed': isStepCompleted('confirmed'),
                        'active': currentStep === 'confirmed'
                    }"
                >
                    <div class="step-counter">3</div>
                    <div class="step-name">Confirmed</div>
                </div>
            </div>
        </div>

        <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading booking details...</p>
        </div>

        <div v-else class="booking-content">
            <!-- Booking Information Card -->
            <div class="info-card">
                <h2 class="card-title">Room Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Room Name:</span>
                        <span class="info-value">{{ details.roomName }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Room Number:</span>
                        <span class="info-value">{{ details.roomNumber || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date:</span>
                        <span class="info-value">{{ formatDate(details.date) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Time:</span>
                        <span class="info-value">{{ getStartTime(details.timeslots) }} - {{ getEndTime(details.timeslots) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Participants:</span>
                        <span class="info-value">{{ details.participant || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Price:</span>
                        <span class="info-value">{{ formatPrice(details.totalPrice) }}</span>
                    </div>
                    
                    <div class="info-item status-item">
                        <span class="info-label">Status:</span>
                        <div v-if="isAdmin" class="status-control">
                            <form @submit.prevent="updateStatus" class="status-form">
                                <Select
                                    v-model="selectedStatus"
                                    :options="statusOptions"
                                    :placeholder="details.status || 'Select a Status'"
                                    class="status-select"
                                    optionLabel="label"
                                    optionValue="value"
                                />
                                <Button 
                                    type="submit" 
                                    label="Update"
                                    severity="success"
                                    class="status-btn"
                                />
                            </form>
                        </div>
                        <span v-else class="status-badge" :class="currentStep">
                            {{ details.status }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Contact Information Card (Admin Only) -->
            <div v-if="isAdmin" class="info-card">
                <h2 class="card-title">Customer Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">{{ details.username || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ details.userEmail || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">{{ details.userContact || 'N/A' }}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Section -->
            <div class="info-card payment-section">
                <h2 class="card-title">Payment Information</h2>
                
                <div v-if="canReturnToPayment" class="payment-actions">
                    <p class="payment-message">Your payment is pending. Please complete the payment to confirm your booking.</p>
                    <Button 
                        label="Return to Payment" 
                        severity="success" 
                        @click="returnToPayment"
                        :disabled="!details.bookingId"
                        class="payment-btn"
                    />
                </div>

                <div v-if="hasPaymentProof" class="payment-proof">
                    <h3 class="proof-title">Payment Proof</h3>
                    <div class="proof-container">
                        <img 
                            :src="details.paymentProof" 
                            :alt="`Payment proof for booking ${details.bookingId}`"
                            @error="handleImageError"
                            class="proof-img"
                        />
                    </div>
                </div>
                
                <div v-else-if="canUploadPaymentProof" class="upload-section">
                    <h3 class="proof-title">Upload Payment Proof</h3>
                    <form @submit.prevent="uploadPaymentProof" class="upload-form">
                        <div class="file-input-container">
                            <input 
                                type="file" 
                                @change="handleFileChange" 
                                accept="image/*" 
                                ref="fileInput"
                                class="file-input"
                                id="payment-proof"
                            />
                            <label for="payment-proof" class="file-label">
                                <span class="file-icon">📎</span>
                                <span class="file-text">{{ selectedFile ? selectedFile.name : 'Choose File' }}</span>
                            </label>
                        </div>
                        <Button 
                            type="submit" 
                            label="Upload"
                            severity="primary"
                            :disabled="!selectedFile"
                            class="upload-btn"
                        />
                    </form>
                </div>
                
                <div v-else-if="!hasPaymentProof && details.status !== 'pending payment'" class="no-proof">
                    <p>No payment proof has been uploaded for this booking.</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="actions-container">
                <Button type="button" label="Back" class="btn-back" @click="router.go(-1)" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Main Container */
.booking-details-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Header */
.booking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
}

.booking-header h1 {
    font-size: 1.8rem;
    color: #333;
    margin: 0;
}

.booking-id {
    font-size: 0.9rem;
    color: #666;
    background-color: #f0f0f0;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-family: monospace;
}

/* Loading State */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #38d02d;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Content Layout */
.booking-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* Info Cards */
.info-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-title {
    font-size: 1.3rem;
    color: #333;
    margin-top: 0;
    margin-bottom: 1.2rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid #f0f0f0;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.2rem;
}

.info-item {
    display: flex;
    flex-direction: column;
}

.info-label {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.3rem;
}

.info-value {
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
}

.status-item {
    grid-column: 1 / -1;
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid #f0f0f0;
}

.status-badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: capitalize;
}

/* Updated status badge colors as requested */
.status-badge.pending-payment {
    background-color: #ffebee; /* Light red background */
    color: #c62828; /* Dark red text */
}

.status-badge.pending-approval {
    background-color: #fff8e1; /* Light yellow background */
    color: #f57c00; /* Dark orange/amber text */
}

.status-badge.confirmed {
    background-color: #e8f5e9; /* Light green background */
    color: #2e7d32; /* Dark green text */
}

.status-form {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.status-select {
    min-width: 180px;
}

/* Progress Stepper - Original Colors Maintained */
.progress-section {
    margin-bottom: 2rem;
}

.stepper-wrapper {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.stepper-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
}

.stepper-item::before {
    position: absolute;
    content: "";
    border-bottom: 2px solid #e0e0e0;
    width: 100%;
    top: 20px;
    left: -50%;
    z-index: 2;
}

.stepper-item::after {
    position: absolute;
    content: "";
    border-bottom: 2px solid #e0e0e0;
    width: 100%;
    top: 20px;
    left: 50%;
    z-index: 2;
}

.stepper-item .step-counter {
    position: relative;
    z-index: 5;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e0e0e0;
    margin-bottom: 0.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.step-name {
    font-size: 0.9rem;
    color: #666;
    text-align: center;
}

.stepper-item.active {
    font-weight: 600;
}

.stepper-item.active .step-counter {
    background-color: #64b5f6; /* Blue for all active states */
    color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.stepper-item.active .step-name {
    color: #1976d2; /* Dark blue for all active states */
}

.stepper-item.completed .step-counter {
    background-color: #4caf50; /* Green for completed */
    color: white;
}

.stepper-item.completed .step-name {
    color: #2e7d32; /* Dark green for completed */
}

.stepper-item.completed::after {
    position: absolute;
    content: "";
    border-bottom: 2px solid #4caf50;
    width: 100%;
    top: 20px;
    left: 50%;
    z-index: 3;
}

.stepper-item:first-child::before {
    content: none;
}
.stepper-item:last-child::after {
    content: none;
}

/* Payment Section */
.payment-section {
    margin-top: 1rem;
}

.payment-actions {
    margin-bottom: 1.5rem;
}

.payment-message {
    color: #ff5722;
    margin-bottom: 1rem;
}

.payment-btn {
    margin-top: 0.5rem;
}

.proof-title {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #555;
}

.proof-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.proof-img {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 4px;
}

.image-error {
    border: 1px dashed #e0e0e0;
    opacity: 0.7;
}

/* Upload Section */
.upload-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 500px;
}

.file-input-container {
    position: relative;
    margin-bottom: 1rem;
}

.file-input {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

.file-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1rem;
    background-color: #f5f5f5;
    border: 1px dashed #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.file-label:hover {
    background-color: #e8e8e8;
}

.file-icon {
    font-size: 1.2rem;
}

.file-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
}

.upload-btn {
    align-self: flex-start;
}

.no-proof {
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 4px;
    color: #666;
    font-style: italic;
}

/* Action Buttons */
.actions-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.btn-back {
    font-weight: 500;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    .booking-details-container {
        padding: 1rem;
    }
    
    .booking-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .booking-id {
        align-self: flex-start;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
    
    .stepper-item {
        font-size: 0.8rem;
    }
    
    .stepper-item .step-counter {
        width: 30px;
        height: 30px;
    }
    
    .stepper-item::before, .stepper-item::after {
        top: 15px;
    }
    
    .step-name {
        font-size: 0.75rem;
    }
    
    .status-form {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .status-select {
        width: 100%;
        min-width: unset;
    }
}

@media (max-width: 480px) {
    .booking-header h1 {
        font-size: 1.5rem;
    }
    
    .card-title {
        font-size: 1.1rem;
    }
    
    .info-label {
        font-size: 0.8rem;
    }
    
    .info-value {
        font-size: 1rem;
    }
}
</style>