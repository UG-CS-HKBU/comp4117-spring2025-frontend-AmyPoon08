<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import Select from 'primevue/select';
import Dropdown from 'primevue/dropdown';

const bookingHistory = ref([]);
const loading = ref(false);

// Pagination state
const first = ref(0);
const rows = ref(3);
const totalRecords = ref(0);

// Status options for filter
const statuses = [
    'pending payment',
    'pending approval',
    'confirmed',
    'expired'
];

// Sorting options
const sortOptions = [
    { label: 'Room Name (A-Z)', value: 'roomName-asc' },
    { label: 'Room Name (Z-A)', value: 'roomName-desc' },
    { label: 'Booking Date (Newest)', value: 'bookingDate-desc' },
    { label: 'Booking Date (Oldest)', value: 'bookingDate-asc' },
    { label: 'Order Date (Newest)', value: 'orderDate-desc' },
    { label: 'Order Date (Oldest)', value: 'orderDate-asc' },
    { label: 'Price (High-Low)', value: 'price-desc' },
    { label: 'Price (Low-High)', value: 'price-asc' }
];

// Initialize filters and sort
const filters = ref({
    global: { value: null, matchMode: 'contains' },
    status: { value: null, matchMode: 'equals' }
});

const sortField = ref('bookingDate-desc'); // Default sort

const clearFilter = () => {
    filters.value = {
        global: { value: null, matchMode: 'contains' },
        status: { value: null, matchMode: 'equals' }
    };
    sortField.value = 'bookingDate-desc';
    // Reset pagination
    first.value = 0;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
};

const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

const getTimeRange = (timeslots) => {
    if (!timeslots || timeslots.length === 0) return '-';
    
    // Sort timeslots chronologically
    const sortedSlots = [...timeslots].sort((a, b) => {
        const [hourA] = a.split(':').map(Number);
        const [hourB] = b.split(':').map(Number);
        return hourA - hourB;
    });
    
    const startTime = sortedSlots[0]; // Get the first timeslot
    
    // Calculate end time (last timeslot + 59 minutes)
    const lastTime = sortedSlots[sortedSlots.length - 1];
    const [hour, minute] = lastTime.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hour, minute + 59);
    
    return `${startTime} - ${endTime.toTimeString().slice(0, 5)}`;
};

const handleImageError = (e) => {
    // Set a fallback image if loading fails
    e.target.src = '/placeholder-room.jpg';
};

// Fetch room details to get images
const fetchRoomDetails = async (roomId) => {
    try {
        const response = await fetch(`https://roombookingsystem-etc7bfeeg8hndfbc.eastasia-01.azurewebsites.net/api/rooms/${roomId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch room details');
        }
        
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Failed to fetch room details:', err);
        return null;
    }
};

const fetchBookingHistory = async () => {
    try {
        loading.value = true;
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please log in.');
        }

        const response = await fetch('https://roombookingsystem-etc7bfeeg8hndfbc.eastasia-01.azurewebsites.net/api/users/bookingHistory', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch booking history');
        }

        const data = await response.json();
        
        // Fetch room details for each booking to get the images
        const bookingsWithRoomDetails = await Promise.all(
            data.map(async (booking) => {
                if (booking.roomId) {
                    const roomDetails = await fetchRoomDetails(booking.roomId);
                    return {
                        ...booking,
                        roomImage: roomDetails?.imageUrl || null,
                        roomDetails: roomDetails || {}
                    };
                }
                return booking;
            })
        );
        
        bookingHistory.value = bookingsWithRoomDetails;
        totalRecords.value = bookingsWithRoomDetails.length;
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    first.value = event.first;
    rows.value = event.rows;
};

// Filter bookings based on global search and status
const filteredBookings = computed(() => {
    let filtered = [...bookingHistory.value];
    
    // Apply global search filter (searches across multiple fields)
    if (filters.value.global.value) {
        const searchTerm = filters.value.global.value.toLowerCase();
        filtered = filtered.filter(booking => 
            booking.bookingId?.toLowerCase().includes(searchTerm) ||
            booking.roomName?.toLowerCase().includes(searchTerm) ||
            formatDate(booking.date)?.toLowerCase().includes(searchTerm) ||
            formatOrderDate(booking.createdAt)?.toLowerCase().includes(searchTerm) ||
            (booking.status?.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply status filter
    if (filters.value.status.value) {
        filtered = filtered.filter(booking => 
            booking.status?.toLowerCase() === filters.value.status.value.toLowerCase()
        );
    }
    
    // Apply sorting
    if (sortField.value) {
        const [field, direction] = sortField.value.split('-');
        
        filtered.sort((a, b) => {
            let valueA, valueB;
            
            // Determine which field to sort by
            switch(field) {
                case 'roomName':
                    valueA = a.roomName?.toLowerCase() || '';
                    valueB = b.roomName?.toLowerCase() || '';
                    break;
                case 'bookingDate':
                    valueA = new Date(a.date || 0).getTime();
                    valueB = new Date(b.date || 0).getTime();
                    break;
                case 'orderDate':
                    valueA = new Date(a.createdAt || 0).getTime();
                    valueB = new Date(b.createdAt || 0).getTime();
                    break;
                case 'price':
                    valueA = parseFloat(a.totalPrice || 0);
                    valueB = parseFloat(b.totalPrice || 0);
                    break;
                default:
                    valueA = a[field] || '';
                    valueB = b[field] || '';
            }
            
            // Handle direction
            if (direction === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
    }
    
    totalRecords.value = filtered.length;
    return filtered;
});

// Get paginated results
const paginatedBookings = computed(() => {
    return filteredBookings.value.slice(first.value, first.value + rows.value);
});

onMounted(() => {
    fetchBookingHistory();
});

// Reset pagination when filters change
watch([filters, sortField], () => {
    first.value = 0;
});
</script>

<template>
    <div class="room-info-container">
        <div class="card main-card">
            <div class="header-section">
                <h1 class="page-title">My Bookings</h1>
                <p class="page-subtitle">View and manage your booking history</p>
            </div>
            
            <!-- Search and Filter Controls -->
            <div class="search-filter-container">
                <div class="filter-row">
                    <!-- Search Input -->
                    <div class="search-wrapper">
                        <span class="p-input-icon-left search-icon-wrapper">
                            <i class="pi pi-search" />
                            <InputText 
                                v-model="filters.global.value" 
                                placeholder="Search..." 
                                class="search-input"
                            />
                        </span>
                    </div>
                    
                    <!-- Sort Dropdown -->
                    <div class="sort-wrapper">
                        <span class="sort-label">Sort by:</span>
                        <Dropdown 
                            v-model="sortField" 
                            :options="sortOptions" 
                            optionLabel="label" 
                            optionValue="value"
                            placeholder="Select" 
                            class="sort-dropdown"
                        />
                    </div>
                    
                    <!-- Status Filter -->
                    <div class="status-wrapper">
                        <span class="filter-label">Status:</span>
                        <Select 
                            v-model="filters.status.value" 
                            :options="statuses" 
                            placeholder="All Statuses" 
                            class="status-filter" 
                            :showClear="true"
                        />
                    </div>
                    
                    <!-- Clear Button -->
                    <Button 
                        type="button" 
                        label="Clear Filters" 
                        class="clear-button"
                        @click="clearFilter()"
                    />
                </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                <p>Loading your bookings...</p>
            </div>
            
            <!-- Empty State -->
            <div v-else-if="filteredBookings.length === 0" class="empty-state">
                <i class="pi pi-calendar-times" style="font-size: 3rem"></i>
                <p>No bookings found</p>
                <router-link to="/rooms" class="p-button p-button-primary">Book a Room</router-link>
            </div>
            
            <!-- Booking Cards Container -->
            <div v-else class="booking-cards">
                <!-- Individual Booking Cards -->
                <div v-for="booking in paginatedBookings" :key="booking.bookingId" class="booking-card">
                    <div class="booking-image-container">
                        <img 
                            :src="booking.roomImage || '/placeholder-room.jpg'" 
                            :alt="booking.roomName" 
                            @error="handleImageError"
                            class="room-image"
                        />
                    </div>
                    
                    <div class="booking-content">
                        <div class="booking-info">
                            <h3 class="room-name">{{ booking.roomName }}</h3>
                            <div class="booking-details">
                                <div class="detail-item">
                                    <strong>Date:</strong> {{ formatDate(booking.date) }}
                                </div>
                                <div class="detail-item">
                                    <strong>Time:</strong> {{ getTimeRange(booking.timeslots) }}
                                </div>
                                
                                <div class="status-container">
                                    <div class="status-badge" :class="booking.status?.toLowerCase().replace(' ', '-')">
                                        {{ booking.status }}
                                    </div>
                                </div>
                                
                                <div class="order-date">
                                    <strong>Order Date:</strong> {{ formatOrderDate(booking.createdAt) }}
                                </div>
                            </div>
                        </div>
                        
                        <div class="booking-price-actions">
                            <div class="price">${{ booking.totalPrice }}</div>
                            <router-link 
                                :to="`/bookingHistory/${booking.bookingId}`" 
                                class="view-details-btn"
                            >
                                View Details
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
                
            <!-- Pagination -->
            <Paginator 
                v-if="filteredBookings.length > 0"
                :first="first" 
                :rows="rows" 
                :totalRecords="totalRecords" 
                @page="onPage"
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                class="custom-paginator"
            />
        </div>
    </div>
</template>
    
<style scoped>
    .room-info-container {
        padding: 2rem;
        background-color: #f8f9fa;
        min-height: calc(100vh - 200px);
    }
    
    .main-card {
        background-color: #f8f9fa;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .header-section {
        margin-bottom: 2rem;
        text-align: center;
    }
    
    .page-title {
        font-size: 2rem;
        color: #2c3e50;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }
    
    .page-subtitle {
        color: #6c757d;
        font-size: 1.1rem;
    }
    
    /* Search and Filter styles */
    .search-filter-container {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
    }
    
    .search-wrapper {
        width: 250px;
    }
    
    .search-icon-wrapper {
        width: 100%;
        display: inline-flex;
    }
    
    .search-input {
        width: 100%;
        border-radius: 6px;
    }
    
    .sort-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 300px;
    }
    
    .sort-label {
        font-weight: 500;
        color: #2c3e50;
        white-space: nowrap;
    }
    
    .sort-dropdown {
        width: 100%;
    }
    
    .status-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 250px;
    }
    
    .filter-label {
        font-weight: 500;
        color: #2c3e50;
        white-space: nowrap;
    }
    
    .status-filter {
        width: 100%;
    }
    
    .clear-button {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        margin-left: auto;
    }
    
    .clear-button:hover {
        background-color: #388E3C;
    }
    
    /* Card styles */
    .booking-cards {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .booking-card {
        display: flex;
        background-color: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        margin-bottom: 1.5rem;
        padding: 1.5rem;
    }
    
    .booking-image-container {
        width: 250px;
        min-width: 250px;
        height: 200px;
        margin-right: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .room-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .booking-content {
        flex: 1;
        display: flex;
        padding: 0;
    }
    
    .booking-info {
        flex: 1;
        padding: 0;
    }
    
    .room-name {
        font-size: 1.8rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    
    .booking-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .detail-item {
        font-size: 1rem;
        color: #4b5563;
    }
    
    .status-container {
        margin-top: 0.75rem;
        margin-bottom: 0.75rem;
    }
    
    .status-badge {
        display: inline-block;
        width: fit-content;
        padding: 0.5rem 1.5rem;
        border-radius: 50px;
        font-weight: 500;
        text-align: center;
    }
    
    .status-badge.confirmed {
        background-color: #9dffb0;
        color: #0f5132;
    }
    
    .status-badge.pending-approval {
        background-color: #ffdd72;
        color: #664d03;
    }
    
    .status-badge.pending-payment {
        background-color: #f8d7da;
        color: #842029;
    }
    
    .status-badge.expired {
        background-color: #e2e3e5;
        color: #41464b;
    }
    
    .order-date {
        font-size: 0.95rem;
        color: #6c757d;
        margin-top: 0.5rem;
    }
    
    .booking-price-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-left: 1.5rem;
        min-width: 170px;
        gap: 1.5rem;
    }
    
    .price {
        font-size: 2.2rem;
        font-weight: 700;
        color: #2c3e50;
        text-align: center;
    }
    
    .view-details-btn {
        display: block;
        text-align: center;
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        background-color: white;
        color: #0067b8;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s;
        border: 2px solid #0067b8;
        width: 100%;
    }
    
    .view-details-btn:hover {
        background-color: #0067b8;
        color: white;
    }
    
    /* Loading and Empty states */
    .loading-state, .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 0;
        color: #6c757d;
        gap: 1rem;
    }
    
    /* Paginator styles */
    .custom-paginator {
        margin-top: 2rem;
        background-color: white;
        border-radius: 8px;
        padding: 0.75rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    /* Media queries for responsiveness */
    @media (max-width: 1200px) {
        .filter-row {
            flex-wrap: wrap;
        }
        
        .search-wrapper, .sort-wrapper, .status-wrapper {
            flex: 1;
            min-width: 200px;
        }
        
        .clear-button {
            margin-left: 0;
        }
    }
    
    @media (max-width: 992px) {
        .booking-card {
            flex-direction: column;
        }
        
        .booking-image-container {
            width: 100%;
            min-width: 100%;
            height: 200px;
            margin-right: 0;
            margin-bottom: 1.5rem;
        }
        
        .booking-content {
            flex-direction: column;
        }
        
        .booking-price-actions {
            width: 100%;
            min-width: 100%;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 0 0 0;
            margin-top: 1rem;
            border-top: 1px solid #e9ecef;
        }
        
        .view-details-btn {
            width: auto;
        }
    }
    
    @media (max-width: 768px) {
        .room-info-container {
            padding: 1rem;
        }
        
        .booking-price-actions {
            flex-direction: column;
            padding: 1rem 0 0 0;
        }
        
        .view-details-btn {
            width: 100%;
        }
        
        .main-card {
            padding: 1rem;
        }
        
        .search-filter-container {
            padding: 1rem;
        }
        
        .room-name {
            font-size: 1.5rem;
        }
        
        .price {
            font-size: 1.8rem;
        }
    }
    
    /* PrimeVue component customization */
    :deep(.p-inputtext) {
        padding: 0.5rem 0.75rem;
        font-size: 0.95rem;
    }
    
    :deep(.p-dropdown) {
        width: 100%;
    }
    
    :deep(.p-dropdown-label) {
        font-size: 0.95rem;
    }
    
    :deep(.p-button) {
        font-weight: 500;
    }
    
    :deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
        background-color: #4CAF50;
        color: white;
    }
    
    :deep(.p-input-icon-left i) {
        left: 0.75rem;
        color: #6c757d;
    }
    
    :deep(.p-input-icon-left input) {
        padding-left: 2.5rem;
    }
</style>
    