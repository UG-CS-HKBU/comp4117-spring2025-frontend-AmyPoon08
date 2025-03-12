<script>
import { ref } from 'vue';
// import DatePicker from 'vue-datepicker-next';

export default {
    // components: {
    //     DatePicker
    // },
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

        // const handleDateRangeChange = (event) => {
        //     const [start, end] = event.target.value.split(' to ');
        //     dateRange.value = [start, end];
        // };
        
        const handleDateRangeChange = (start, end) => {
            dateRange.value = [start, end];
        };

        // const startDate = ref(null);
        // const endDate = ref(null);
        // const startTime = ref('');
        // const endTime = ref('');
        // const showTimeOptions = ref(false);
        // const timeOptions = [
        //     { label: 'All time range', value: '00:00 - 23:59' },
        //     { label: 'Working hours', value: '09:00 - 19:00' },
        //     { label: 'Morning', value: '09:00 - 12:00' },
        //     { label: 'Afternoon', value: '12:00 - 16:00' },
        //     { label: 'Evening', value: '16:00 - 22:00' }
        // ];

        // const setTimeRange = (range) => {
        //     [startTime.value, endTime.value] = range.split(' - ');
        // };

        const roomOptions = ref([
            { label: 'Select All', value: 'select_all', checked: false },
            { label: 'Single room', value: 'single_room', checked: false },
            { label: 'Share room', value: 'share_room', checked: false }
        ]);

        const categoryOptions = ref([
            { label: 'Select All', value: 'select_all', checked: false },
            { label: 'Room 1', value: 'room_1', checked: false },
            { label: 'Room 2', value: 'room_2', checked: false }
        ]);

        const capacityOptions = ref([
            { label: 'Select All', value: 'select_all', checked: false },
            { label: '≤5', value: 'below_5', checked: false },
            { label: '≤10', value: 'below_10', checked: false }
        ]);

        const participantOptions = ref([
            { label: 'Select All', value: 'select_all', checked: false },
            { label: '≤5', value: 'below_5', checked: false },
            { label: '≤10', value: 'below_10', checked: false },
            { label: '≤20', value: 'below_20', checked: false },
            { label: '20 or above', value: 'above_20', checked: false }
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

        const toggleParticipantSelectAll = () => {
            const selectAllOption = participantOptions.value.find(option => option.value === 'select_all');
            const isChecked = selectAllOption.checked;
            participantOptions.value.forEach(option => {
                option.checked = isChecked;
            });
        };

        const handleParticipantOptionChange = (option) => {
            if (option.value === 'select_all') {
                toggleParticipantSelectAll();
            } else {
                const allChecked = participantOptions.value.every(opt => opt.value === 'select_all' || opt.checked);
                participantOptions.value.find(opt => opt.value === 'select_all').checked = allChecked;
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


        return {
            // startDate,
            // endDate,
            // startTime,
            // endTime,
            dateRange,
            timeRange,
            timeOptions,
            roomOptions,
            categoryOptions,
            capacityOptions,
            participantOptions,
            priceOptions,
            availabilityOptions,
            // setTimeRange,
            handleTimeRangeChange,
            handleDateRangeChange,
            handleRoomOptionChange,
            handleCategoryOptionChange,
            handleCapacityOptionChange,
            handleParticipantOptionChange,
            handlePriceOptionChange,
            handleAvailabilityOptionChange,
            // showTimeOptionsx
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

            <!-- Time Range -->
            <div class="col-md-6">
                <div class="d-flex align-items-center">
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
        </div>

        <div class="row">
            <div class="col-2">
                <label class="form-label">Room Type Options:</label>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Select Room Options
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
            <div class="col-2">
                <label class="form-label">Category Options:</label>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonCategory"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Select Category Options
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
                        Select Capacity Options
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
                <label class="form-label">Participant Options:</label>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonParticipant"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Select Participant Options
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButtonParticipant">
                        <li v-for="option in participantOptions" :key="option.value" class="dropdown-item">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" :id="option.value"
                                    v-model="option.checked" @change="handleParticipantOptionChange(option)">
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
                        Select Price Options
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

            <div class="col-2">
                <label class="form-label">Availability Options:</label>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonAvailability"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Select Availability Options
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
    </div>
</template>
