<script>
import { ref, onMounted, watch, computed } from 'vue';
// import DatePicker from 'vue-datepicker-next';

export default {
    setup() {
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
                switch (capacity) {
                    case '≥5': return roomCapacity >= 5;
                    case '≥10': return roomCapacity >= 10;
                    case '≥20': return roomCapacity >= 20;
                    default: return false;
                }
            });
        };

        const checkPrice = (selectedPrices, price) => {
            return selectedPrices.some(range => {
                switch (range) {
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
                switch (status) {
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
            filteredRooms
        };
    }
};
</script>

<template>
    <div class="container mt-5">
        <div class="text-center mb-4">
            <h1>Book for all desires</h1>
        </div>

        <div class="row mb-2">
            <div class="col-md-6">
                <label class="form-label">Date Range:</label>
            </div>
            <div class="col-md-6">
                <label class="form-label">Time Range:</label>
            </div>
        </div>

        <div class="row mb-3">
            <!-- Date Range -->
            <div class="col-md-6">
                <div class="d-flex align-items-center">
                    <input type="date" class="form-control" v-model="dateRange[0]" />
                    <span class="mx-2">to</span>
                    <input type="date" class="form-control" v-model="dateRange[1]" />
                </div>
            </div>

            <!-- Time Range -->
            <div class="col-md-6">
                <div class="d-flex align-items-center">
                    <select v-model="timeRange[0]" class="form-control">
                        <option v-for="time in timeOptions" :key="time" :value="time">
                            {{ time }}
                        </option>
                    </select>
                    <span class="mx-2">to</span>
                    <select v-model="timeRange[1]" class="form-control">
                        <option v-for="time in timeOptions" :key="time" :value="time">
                            {{ time }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-2">
            <label class="form-label">Room Type Options:</label>
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                data-bs-toggle="dropdown" aria-expanded="false">
                {{ roomOptions.filter(option => option.checked && option.value !== 'select_all').map(option => option.label).join(', ') || 'Select Room Options' }}
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
            </div>
            <div class="col-4">
                <label class="form-label">Category Options:</label>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonCategory"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        {{ categoryOptions.filter(option => option.checked && option.value !== 'select_all').map(option => option.label).join(', ') || 'Select Category Options' }}
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
            </div>

            <div class="col-2">
                <label class="form-label">Capacity Options:</label>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonCapacity"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        {{ capacityOptions.filter(option => option.checked && option.value !== 'select_all').map(option => option.label).join(', ') || 'Select Capacity Options' }}
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
            </div>

            <div class="col-2">
                <label class="form-label">Price Options:</label>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonPrice"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        {{ priceOptions.filter(option => option.checked && option.value !== 'select_all').map(option => option.label).join(', ') || 'Select Price Options' }}
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

            <div class="col-3">
                <label class="form-label">Availability Options:</label>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonAvailability"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        {{ availabilityOptions.filter(option => option.checked && option.value !== 'select_all').map(option => option.label).join(', ') || 'Select Availability Options' }}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButtonAvailability">
                        <li v-for="option in availabilityOptions" :key="option.value" class="dropdown-item">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" :id="option.value"
                                    v-model="option.checked" @change="handleAvailabilityOptionChange(option)">
                                <label class="form-check-label" :for="option.value">{{ option.label }}</label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col-12">
            <div class="input-group">
                <input type="text" v-model="searchQuery" class="form-control" placeholder="Search keyword" />
                <button class="btn btn-primary" @click="fetchRooms">Search</button>
            </div>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col-12">

                <div class="row">
                    <div class="col-md-4 mb-4" v-for="room in filteredRooms" :key="room._id">
                        <div class="card h-200">
                            <img v-if="room.imageUrl" :src="room.imageUrl" :alt="room.name" class="room-image"
                                @error="handleImageError" />
                            <div class="card-body">
                                <h5 class="card-title font-weight-bold">{{ room.name }}</h5>
                                <p class="card-description">{{ room.description }}</p>
                                <p class="card-text"><strong>Price:</strong> {{ room.price }}</p>
                                <a :href="`/roomdetails/${room._id}`">
                                    <button id="Edit" class="btn btn-primary">More Details</button>
                                </a>
                                <a :href="`/bookings/book/${room._id}`">
                                    <button id="Edit" class="btn btn-primary">Book Now!</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.room-image {
    height: 200px;
    width: 100%;
    object-fit: cover;
}

.card-description {
    height: 100px;
    overflow: auto;
}
</style>