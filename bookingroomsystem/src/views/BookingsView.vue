<script>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
// import DatePicker from 'vue-datepicker-next';

export default {
    
    
    setup() {

        // State for expanded cards
        const expandedCards = ref({});
        const textOverflow = ref({});

        // Text overflow detection functions
        const checkTextOverflow = () => {
            nextTick(() => {
                const descriptions = document.querySelectorAll('.card-description');
                descriptions.forEach(desc => {
                    const roomId = desc.closest('.col-md-4').getAttribute('data-room-id');
                    textOverflow.value[roomId] = desc.scrollHeight > desc.clientHeight;
                });
            });
        };

        const toggleDescription = (roomId) => {
            expandedCards.value[roomId] = !expandedCards.value[roomId];
        };

        const isTextOverflowing = (roomId) => {
            return textOverflow.value[roomId];
        };


        const dateRange = ref([null, null]);
        const timeRange = ref([null, null]);

        const generateTimeOptions = () => {
            const options = [];
            for (let hour = 0; hour < 24; hour++) {
                const formattedHour = hour.toString().padStart(2, '0') + ':00';
                options.push(formattedHour);
            }
            return options;
        };

        const timeOptions = ref(generateTimeOptions());

        const handleTimeRangeChange = (event) => {
            const [start, end] = event.target.value.split(' to ');
            if (start && end && start !== end) {
                timeRange.value = [start, end];
            }
        };
        
        const handleDateRangeChange = (start, end) => {
            dateRange.value = [start, end];
        };

        const roomOptions = ref([
            { label: 'Select All', value: 'select_all', checked: false },
            { label: 'Single room', value: 'Single room', checked: false },
            { label: 'Share room', value: 'Share room', checked: false }
        ]);

        const categoryOptions = ref([
            { label: 'Select All', value: 'select_all', checked: false },
            { label: 'Room 1', value: 'Room 1', checked: false },
            { label: 'Room 2', value: 'Room 2', checked: false },
            { label: 'Room 3', value: 'Room 3', checked: false },
            { label: 'Room 4', value: 'Room 4', checked: false },
            { label: 'Room 5', value: 'Room 5', checked: false },
        ]);

        const capacityOptions = ref([
            { label: 'Select All', value: 'select_all', checked: false },
            { label: '≥5', value: '≥5', checked: false },
            { label: '≥10', value: '≥10', checked: false },
            { label: '≥20', value: '≥20', checked: false }
        ]);

        // const participantOptions = ref([
        //     { label: 'Select All', value: 'select_all', checked: false },
        //     { label: '≥5', value: '≥5', checked: false },
        //     { label: '≥10', value: '≥10', checked: false },
        //     { label: '≥20', value: '≥20', checked: false }
        // ]);

        const priceOptions = ref([
            { label: 'Select All', value: 'select_all', checked: false },
            { label: '$0 - $100', value: 'below_100', checked: false },
            { label: '$101 - $200', value: '101_to_200', checked: false },
            { label: '$201 - $300', value: '201_to_300', checked: false },
            { label: '$301 or above', value: 'above_301', checked: false }
        ]);

        const availabilityOptions = ref([
            { label: 'Select All', value: 'select_all', checked: false },
            { label: 'Low Availability', value: 'low_availability', checked: false },
            { label: 'High Availability', value: 'high_availability', checked: false },
        ]);


        const toggleRoomSelectAll = () => {
            const selectAllOption = roomOptions.value.find(option => option.value === 'select_all');
            const isChecked = selectAllOption.checked;
            roomOptions.value.forEach(option => {
                option.checked = isChecked;
            });
        };

        const handleRoomOptionChange = (option) => {
            if (option.value === 'select_all') {
                toggleRoomSelectAll();
            } else {
                const allChecked = roomOptions.value.every(opt => opt.value === 'select_all' || opt.checked);
                roomOptions.value.find(opt => opt.value === 'select_all').checked = allChecked;
            }
        };

        const toggleCategorySelectAll = () => {
            const selectAllOption = categoryOptions.value.find(option => option.value === 'select_all');
            const isChecked = selectAllOption.checked;
            categoryOptions.value.forEach(option => {
                option.checked = isChecked;
            });
        };

        const handleCategoryOptionChange = (option) => {
            if (option.value === 'select_all') {
                toggleCategorySelectAll();
            } else {
                const allChecked = categoryOptions.value.every(opt => opt.value === 'select_all' || opt.checked);
                categoryOptions.value.find(opt => opt.value === 'select_all').checked = allChecked;
            }
        };

        const toggleCapacitySelectAll = () => {
            const selectAllOption = capacityOptions.value.find(option => option.value === 'select_all');
            const isChecked = selectAllOption.checked;
            capacityOptions.value.forEach(option => {
                option.checked = isChecked;
            });
        };

        const handleCapacityOptionChange = (option) => {
            if (option.value === 'select_all') {
                toggleCapacitySelectAll();
            } else {
                const allChecked = capacityOptions.value.every(opt => opt.value === 'select_all' || opt.checked);
                capacityOptions.value.find(opt => opt.value === 'select_all').checked = allChecked;
            }
        };

        const togglePriceSelectAll = () => {
            const selectAllOption = priceOptions.value.find(option => option.value === 'select_all');
            const isChecked = selectAllOption.checked;
            priceOptions.value.forEach(option => {
                option.checked = isChecked;
            });
        };

        const handlePriceOptionChange = (option) => {
            if (option.value === 'select_all') {
                togglePriceSelectAll();
            } else {
                const allChecked = priceOptions.value.every(opt => opt.value === 'select_all' || opt.checked);
                priceOptions.value.find(opt => opt.value === 'select_all').checked = allChecked;
            }
        };

        const toggleAvailabilitySelectAll = () => {
            const selectAllOption = availabilityOptions.value.find(option => option.value === 'select_all');
            const isChecked = selectAllOption.checked;
            availabilityOptions.value.forEach(option => {
                option.checked = isChecked;
            });
        };

        const handleAvailabilityOptionChange = (option) => {
            if (option.value === 'select_all') {
                toggleAvailabilitySelectAll();
            } else {
                const allChecked = availabilityOptions.value.every(opt => opt.value === 'select_all' || opt.checked);
                availabilityOptions.value.find(opt => opt.value === 'select_all').checked = allChecked;
            }
        };

        const searchQuery = ref('');
        const rooms = ref([]);

        let searchDebounceTimeout;

        watch(searchQuery, (newQuery) => {
            // Add debounce to prevent too many API calls
            if (searchDebounceTimeout) {
                clearTimeout(searchDebounceTimeout);
            }
            searchDebounceTimeout = setTimeout(() => {
                const query = newQuery ? `?name=${encodeURIComponent(newQuery)}` : '';
                fetchRooms(query);
            }, 10); // Wait 10ms after user stops typing
        });

        // Add watcher for card updates
        watch(rooms, () => {
            nextTick(() => {
                checkTextOverflow();
            });
        });

 
        const fetchRooms = async (query = '') => {
            try {
                const response = await fetch(`/api/rooms${query}`);
                if (!response.ok) {
                throw new Error('Failed to fetch rooms');
                }
                rooms.value = await response.json();
            } catch (error) {
                console.error('Error fetching rooms:', error.message);
            }
        };

        const filteredRooms = computed(() => {
            return rooms.value.filter(room => {
                // Get selected options (excluding 'select_all')
                const selectedRoomTypes = roomOptions.value
                    .filter(opt => opt.checked && opt.value !== 'select_all')
                    .map(opt => opt.value);
                
                const selectedCategories = categoryOptions.value
                    .filter(opt => opt.checked && opt.value !== 'select_all')
                    .map(opt => opt.value);

                const selectedCapacities = capacityOptions.value
                    .filter(opt => opt.checked && opt.value !== 'select_all')
                    .map(opt => opt.value);

                // const selectedParticipants = participantOptions.value
                //     .filter(opt => opt.checked && opt.value !== 'select_all')
                //     .map(opt => opt.value);

                const selectedPrices = priceOptions.value
                    .filter(opt => opt.checked && opt.value !== 'select_all')
                    .map(opt => opt.value);

                const selectedAvailability = availabilityOptions.value
                    .filter(opt => opt.checked && opt.value !== 'select_all')
                    .map(opt => opt.value);

                // If no options are selected in a category, don't filter for that category
                const matchesRoomType = selectedRoomTypes.length === 0 || 
                    selectedRoomTypes.some(type => type.toLowerCase().trim() === room.type.toLowerCase().trim());

                const matchesCategory = selectedCategories.length === 0 || 
                    selectedCategories.includes(room.category);

                const matchesCapacity = selectedCapacities.length === 0 || 
                    checkCapacity(selectedCapacities, room.capacity);

                // const matchesParticipants = selectedParticipants.length === 0 || 
                //     checkParticipants(selectedParticipants, room.maxParticipants);

                const matchesPrice = selectedPrices.length === 0 || 
                    checkPrice(selectedPrices, room.price);

                const matchesAvailability = selectedAvailability.length === 0 || 
                    checkAvailability(selectedAvailability, room.availability);

                // Search query filter
                const matchesSearch = !searchQuery.value || 
                    room.name.toLowerCase().includes(searchQuery.value.toLowerCase());

                return matchesRoomType && 
                       matchesCategory && 
                       matchesCapacity && 
                    //    matchesParticipants && 
                       matchesPrice && 
                       matchesAvailability && 
                       matchesSearch;
            });
        });

        // Helper functions for checking ranges
        const checkCapacity = (selectedCapacities, roomCapacity) => {
            return selectedCapacities.some(capacity => {
                switch(capacity) {
                    case '≥5': return roomCapacity >= 5;
                    case '≥10': return roomCapacity >= 10;
                    case '≥20': return roomCapacity >= 20;
                    default: return false;
                }
            });
        };

        const checkPrice = (selectedPrices, price) => {
            return selectedPrices.some(range => {
                switch(range) {
                    case 'below_100': return price <= 100;
                    case '101_to_200': return price > 100 && price <= 200;
                    case '201_to_300': return price > 200 && price <= 300;
                    case 'above_301': return price > 300;
                    default: return false;
                }
            });
        };

        const checkAvailability = (selectedAvailability, availability) => {
            return selectedAvailability.some(status => {
                switch(status) {
                    case 'low_availability': return availability < 50;
                    case 'high_availability': return availability >= 50;
                    default: return false;
                }
            });
        };

        // Add watchers for filter changes
        watch([
            roomOptions,
            categoryOptions,
            capacityOptions,
            // participantOptions,
            priceOptions,
            availabilityOptions
        ], () => {
            // You might want to update the API call here if you're filtering on the server
            fetchRooms();
        }, { deep: true });




        onMounted(() => {
            fetchRooms();
            checkTextOverflow();
        });


        return {
            dateRange,
            timeRange,
            timeOptions,
            roomOptions,
            categoryOptions,
            capacityOptions,
            // participantOptions,
            priceOptions,
            availabilityOptions,
            handleTimeRangeChange,
            handleDateRangeChange,
            handleRoomOptionChange,
            handleCategoryOptionChange,
            handleCapacityOptionChange,
            // handleParticipantOptionChange,
            handlePriceOptionChange,
            handleAvailabilityOptionChange,
            // handleSearch,
            searchQuery,
            rooms,
            filteredRooms,
            expandedCards,
            textOverflow,
            toggleDescription,
            isTextOverflowing
        };
    }
};
</script>

<template>
    <div class="container mt-5">
        <div class="text-center mb-4">
            <h1>Book for all desires</h1>
        </div>

        <div class="row mb-5">
            <div class="row mb-2">
                <div class="col-md-4">
                    <label class="form-label">Date Range:</label>
                </div>
            </div>
            <div class="row mb-3">
                <!-- Date Range -->
                <div class="col-md-4">
                    <div class="picker-container">
                        <input 
                            type="date" 
                            class="form-control" 
                            v-model="dateRange[0]"
                        />
                        <span class="mx-2">to</span>
                        <input 
                            type="date" 
                            class="form-control" 
                            v-model="dateRange[1]"
                        />
                    </div>
                </div>
                
                <!-- Filter options -->
                <div class="col-8">
                    <div class="filter-options">
                        <div class="dropdown filter-dropdown">
                            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                Room Type
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <li v-for="option in roomOptions" :key="option.value" class="dropdown-item">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" :id="option.value"
                                            v-model="option.checked" @change="handleRoomOptionChange(option)">
                                        <label class="form-check-label" :for="option.value">{{ option.label }}</label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="dropdown filter-dropdown">
                            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonCategory"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                Category
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButtonCategory">
                                <li v-for="option in categoryOptions" :key="option.value" class="dropdown-item">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" :id="option.value"
                                            v-model="option.checked" @change="handleCategoryOptionChange(option)">
                                        <label class="form-check-label" :for="option.value">{{ option.label }}</label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="dropdown filter-dropdown">
                            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonCapacity"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                Capacity
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButtonCapacity">
                                <li v-for="option in capacityOptions" :key="option.value" class="dropdown-item">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" :id="option.value"
                                            v-model="option.checked" @change="handleCapacityOptionChange(option)">
                                        <label class="form-check-label" :for="option.value">{{ option.label }}</label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="dropdown filter-dropdown">
                            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonPrice"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                Price
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButtonPrice">
                                <li v-for="option in priceOptions" :key="option.value" class="dropdown-item">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" :id="option.value"
                                            v-model="option.checked" @change="handlePriceOptionChange(option)">
                                        <label class="form-check-label" :for="option.value">{{ option.label }}</label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-md-4">
                    <label class="form-label">Time Range:</label>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-4">
                    <div class="picker-container">
                        <select 
                            v-model="timeRange[0]" 
                            class="form-control"
                        >
                            <option v-for="time in timeOptions" :key="time" :value="time">
                                {{ time }}
                            </option>
                        </select>
                        <span class="mx-2">to</span>
                        <select 
                            v-model="timeRange[1]" 
                            class="form-control"
                        >
                            <option v-for="time in timeOptions" :key="time" :value="time">
                                {{ time }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="col-8">
                    <input 
                        type="text" 
                        v-model="searchQuery" 
                        class="form-control" 
                        placeholder="Search..."
                    />
                </div>
            </div>
        </div>

        <div class="row"> <!-- Add this wrapper row -->
            <div class="col-md-4 mb-4" 
                v-for="room in filteredRooms" 
                :key="room._id"
                :data-room-id="room._id">
                <div class="card room-card">
                    <div class="image-container">
                        <img 
                            v-if="room.imageUrl" 
                            :src="room.imageUrl" 
                            :alt="room.name"
                            class="room-image"
                            @error="handleImageError"
                        />
                        <div v-else class="placeholder-image">
                            No Image Available
                        </div>
                    </div>
                    
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-truncate mb-2">{{ room.name }}</h5>
                        
                        <div class="description-container">
                            <p class="card-description" 
                            :class="{ 'expanded': expandedCards[room._id] }">
                                {{ room.description }}
                            </p>
                            <button 
                                v-if="isTextOverflowing(room._id)"
                                class="show-more-btn"
                                @click="toggleDescription(room._id)">
                                {{ expandedCards[room._id] ? 'Show Less' : 'Show More' }}
                            </button>
                        </div>

                        <div class="card-footer-content mt-auto">
                            <p class="price-text mb-2">
                                <strong>Price:</strong> {{ room.price }}
                            </p>
                            <a :href="`/bookings/book/${room._id}`" class="w-100">
                                <button class="btn btn-primary w-100">Book Now!</button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.picker-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.picker-container .form-control {
    flex: 1;
    min-width: 0;
    width: calc(50% - 20px); 
}

.picker-container span {
    flex: 0 0 auto;
}

.filter-options {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
}

.filter-dropdown {
    flex: 1;
}

.btn-secondary {
    width: 100%;
    height: 38px;
}

@media (max-width: 768px) {
    .picker-container {
        flex-direction: column;
    }

    .picker-container .form-control {
        width: 100%;
    }

    .filter-options {
        flex-wrap: wrap;
    }

    .filter-dropdown {
        flex: 1 1 calc(50% - 4px);
    }
}

.room-card {
    height: 450px; /* Increased height slightly */
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 8px;
    overflow: hidden;
}

.room-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-container {
    height: 45%; /* Slightly larger image area */
    overflow: hidden;
    position: relative;
    background-color: #f8f9fa;
}

.room-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.card-body {
    height: 55%;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.card-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
}

.description-container {
    position: relative;
    flex-grow: 1;
    overflow: hidden;
    padding-bottom: 1.5rem; /* Add padding at bottom to make space for button */
}

.card-description {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #6c757d;
    overflow: hidden;
    position: relative;
    max-height: 4.5em; /* Show 3 lines by default */
    transition: max-height 0.3s ease;
}

.card-description.expanded {
    max-height: 200px; /* Larger value to show full text */
}

.show-more-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background: linear-gradient(to left, white 50%, rgba(255, 255, 255, 0.9) 100%);
    border: none;
    color: #007bff;
    font-size: 0.85rem;
    padding: 0 4px;
    cursor: pointer;
    width: auto;
    height: 1.5rem; /* Fixed height */
    line-height: 1.5rem; /* Match height for vertical centering */
    display: flex;
    align-items: center;
}

.show-more-btn::before {
    content: '';
    position: absolute;
    right: 100%;
    width: 50px;
    height: 100%;
    background: linear-gradient(to right, rgba(255, 255, 255, 0), white);
}

.show-more-btn:hover {
    text-decoration: underline;
}

.card-footer-content {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.price-text {
    font-size: 1.1rem;
    color: #212529;
    margin-bottom: 0.75rem;
}

.btn-primary {
    padding: 0.625rem 1rem;
    font-weight: 500;
    border-radius: 6px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .room-card {
        height: 420px;
    }

    .card-title {
        font-size: 1.1rem;
    }

    .card-description {
        font-size: 0.85rem;
        max-height: 3.75em; /* Show 2.5 lines on mobile */
    }
}
</style>

