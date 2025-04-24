<script setup>
import { ref, onMounted, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import config from '../config';

const bookingRecords = ref([]);
const loading = ref(false);
const dt = ref(null);

// Status options for filter
const statuses = [
    'pending payment',
    'pending approval',
    'confirmed'
];

const filters = ref({
    global: { value: null, matchMode: 'contains'},
    _id: { value: null, matchMode: 'contains'},
    username: { value: null, matchMode: 'contains' }, 
    roomName: { value: null, matchMode: 'contains'},
    date: { value: null, matchMode: 'dateIs'},
    status: { value: null, matchMode: 'equals'}
});

// Custom filter function for case-insensitive filtering
const filterCaseInsensitive = (value, filter) => {
    if (filter === undefined || filter === null || filter.trim() === '') {
        return true;
    }
    
    if (value === undefined || value === null) {
        return false;
    }
    
    return String(value).toLowerCase().indexOf(String(filter).toLowerCase()) !== -1;
};

const registerDateFilter = () => {
    if (window.PrimeVue && window.PrimeVue.config.filterService) {
        window.PrimeVue.config.filterService.register('dateIs', (value, filter) => {
            if (filter === undefined || filter === null) {
                return true;
            }
            
            if (value === undefined || value === null) {
                return false;
            }
            
            try {
                let valueDate = new Date(value);
                let filterDate = new Date(filter);
                
                if (isNaN(valueDate.getTime())) {
                    // Try parsing as DD/MM/YYYY
                    if (typeof value === 'string' && value.includes('/')) {
                        const [day, month, year] = value.split('/').map(Number);
                        valueDate = new Date(year, month - 1, day);
                    }
                }
                
                if (isNaN(filterDate.getTime())) {
                    if (filter instanceof Date) {
                        filterDate = filter;
                    }
                }
                
                if (isNaN(valueDate.getTime()) || isNaN(filterDate.getTime())) {
                    console.warn('Invalid date in comparison:', { value, filter });
                    return false;
                }
                
                return valueDate.getFullYear() === filterDate.getFullYear() &&
                       valueDate.getMonth() === filterDate.getMonth() &&
                       valueDate.getDate() === filterDate.getDate();
            } catch (error) {
                console.error('Date comparison error:', error);
                return false;
            }
        });
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateString);
            return dateString;
        }
        
        // Format as DD/MM/YYYY
        return `${date.getDate().toString().padStart(2, '0')}/${
            (date.getMonth() + 1).toString().padStart(2, '0')}/${
            date.getFullYear()}`;
    } catch (error) {
        console.error('Date formatting error:', error);
        return dateString;
    }
};

const clearFilter = () => {
    filters.value = {
        global: { value: null, matchMode: 'contains'},
        _id: { value: null, matchMode: 'contains'},
        username: { value: null, matchMode: 'contains' }, 
        roomName: { value: null, matchMode: 'contains'},
        date: { value: null, matchMode: 'dateIs'},
        status: { value: null, matchMode: 'equals'}
    };
};


const fetchBookingRecords = async () => {
    try {
        loading.value = true;
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please log in.');
        }

        const response = await fetch(`${config.apiBaseUrl}/bookings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        bookingRecords.value = data.map(booking => ({
            ...booking,
            dateObject: booking.date ? new Date(booking.date) : null
        }));
        
        console.log('Fetched booking records:', bookingRecords.value);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.value = false;
    }
};


const applyDateFilter = () => {
    if (dt.value) {
        dt.value.filter();
    }
};

// const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB');
// };


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
    
    const sortedSlots = [...timeslots].sort((a, b) => {
        const [hourA, minA] = a.split(':').map(Number);
        const [hourB, minB] = b.split(':').map(Number);
        return hourA * 60 + minA - (hourB * 60 + minB);
    });
    
    // Add 59 minutes to the last time slot
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    const [hour, minute] = lastSlot.split(':').map(Number);
    const endHour = Math.floor((minute + 59) / 60) + hour;
    const endMinute = (minute + 59) % 60;
    
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}


const getStatusSeverity = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending payment':
            return 'danger';
        case 'pending approval':
            return 'warn';
        case 'confirmed':
            return 'success';
        default:
            return null;
    }
};

const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending payment':
            return 'danger';
        case 'pending approval':
            return 'warn'
        case 'confirmed':
            return 'success';
        default:
            return {};
    }
};

onMounted(() => {
    fetchBookingRecords();
    registerDateFilter();
});
</script>

<template>
<div class="room-info-container">
    <div class="card">
        <div class="header-section">
            <h1 class="page-title">Booking Records</h1>
            <p class="page-subtitle">View and manage all booking records</p>
        </div>
        <DataTable 
            ref="dt"
            v-model:filters="filters" 
            :value="bookingRecords" 
            paginator 
            showGridlines 
            :rows="10" 
            dataKey="_id"
            filterDisplay="menu" 
            :loading="loading"
            :globalFilterFields="['_id', 'username', 'roomName', 'date']"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} bookings"
            class="custom-datatable"
        >
            <template #header>
                <div class="flex items-center gap-4 header-controls">
                    <div class="left-controls">
                        <span class="p-input-icon-left search-wrapper">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Search bookings..." class="search-input"/>
                        </span>
                        <Button 
                            type="button" 
                            label="Clear Filters" 
                            class="p-button-outlined"
                            @click="clearFilter()"
                        />
                    </div>
                </div>
            </template>

            <template #empty> No booking found. </template>
            <template #loading> Loading booking records. Please wait. </template>

            <Column field="index" header="No." style="min-width: 5rem">
                <template #body="{ index }">
                    {{ index + 1 }}
                </template>
            </Column>

            <Column field="_id" header="Booking ID" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data._id }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search booking ID"
                        @input="filterCallback()"
                    />
                </template>
            </Column>

            <Column field="username" header="Username" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.username }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search username"
                        @input="filterCallback()"
                    />
                </template>
            </Column>

            <Column field="roomName" header="Room" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.roomName }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search room"
                        @input="filterCallback()"
                    />
                </template>
            </Column>

            <Column field="date" header="Date" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatDate(data.date) }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Calendar 
                        v-model="filterModel.value" 
                        dateFormat="dd/mm/yy" 
                        placeholder="Select date" 
                        class="p-2 w-full"
                        @date-select="applyDateFilter"
                        @clear="filterCallback()"
                    />
                </template>
            </Column>

            <Column field="timeslots" header="Start Time" style="min-width: 10rem">
                <template #body="slotProps">
                    {{ getStartTime(slotProps.data.timeslots) }}
                </template>
            </Column>

            <Column field="timeslots" header="End Time" style="min-width: 10rem">
                <template #body="slotProps">
                    {{ getEndTime(slotProps.data.timeslots) }}
                </template>
            </Column>
            
            <Column field="status" header="Status" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getStatusSeverity(data.status)" :style="getStatusStyle(data.status)" />
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Select 
                        v-model="filterModel.value" 
                        :options="statuses" 
                        placeholder="Select Status" 
                        class="p-2 w-full" 
                        :showClear="true"
                        @change="filterCallback()"
                    >
                        <template #option="slotProps">
                            <Tag :value="slotProps.option" :severity="getStatusSeverity(slotProps.option)" :style="getStatusStyle(slotProps.option)" />
                        </template>
                    </Select>
                </template>
            </Column>

            <Column header="Actions" :exportable="false" style="min-width: 8rem">
                <template #body="slotProps">
                    <router-link 
                        :to="`/bookingHistory/${slotProps.data._id}`" 
                        class="p-button p-button-primary p-button-sm"
                    >
                        View
                    </router-link>
                </template>
            </Column>
        </DataTable>
    </div>
</div>
</template>

<style scoped>
.room-info-container {
    padding: 2rem;
    background-color: #f8f9fa;
    min-height: calc(100vh - 200px);
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

.header-controls {
    background-color: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.left-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.search-wrapper {
    width: 400px;
    display: inline-flex;
}

:deep(.custom-datatable) {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    padding: 1rem;
}

:deep(.p-datatable) {
    background-color: white;
}

:deep(.p-datatable .p-datatable-header) {
    background-color: white;
    border: none;
    padding: 1rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: white;
    color: #2c3e50;
    font-weight: 600;
    padding: 1rem;
    border-bottom: 2px solid #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    background-color: white;
    border-bottom: 1px solid #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    background-color: white;
    color: #2c3e50;
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #f8f9fa !important;
}

:deep(.p-button) {
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-weight: 500;
}

:deep(.p-button-primary) {
    background-color: #4CAF50;
    color: #000000;
    border-color: #45a049;
    white-space: nowrap;
    min-width: fit-content;
    padding: 0.5rem 1rem;
}

:deep(.p-button-primary:hover) {
    background-color: #2E7D32;
    color: #000000;
    border-color: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
}

:deep(.p-button-primary:focus) {
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

:deep(.p-button-primary.p-button-sm) {
    background-color: #bfe5ff;
    border-color: #bfe5ff;
    color: rgb(18, 0, 214);
    text-decoration: none;
    padding: 0.4rem 0.8rem;
}

:deep(.p-button-primary.p-button-sm:hover) {
    background-color: #40aaf0;
    border-color: #40aaf0;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);
}

:deep(.p-button-primary.p-button-sm:focus) {
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

:deep(.p-button-outlined) {
    /* Change initial state */
    background-color: transparent !important; 
    color: #346bf6 !important;
    border-color: #346bf6 !important;
    white-space: nowrap;
    min-width: fit-content;
    padding: 0.5rem 1rem;
}

:deep(.p-button-outlined:hover) {
    /* Change hover state */
    background-color: #346bf6 !important;
    color: #ffffff !important;
    border-color: #346bf6 !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(52, 107, 246, 0.2);
}

:deep(.p-button-outlined:focus) {
    box-shadow: 0 0 0 2px rgba(52, 107, 246, 0.2);
}

:deep(.p-inputtext) {
    border-radius: 6px;
    border: 1px solid #ced4da;
    padding: 0.5rem 1rem;
    background-color: white;
    color: #2c3e50;
}

:deep(.p-input-icon-left) {
    width: 100%;
    display: inline-flex;
}

:deep(.p-input-icon-left i) {
    color: #6c757d;
    font-size: 1.1rem;
    margin-top: 2px;
}

:deep(.p-inputtext:enabled:focus) {
    border-color: #2c3e50;
    box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.1);
    background-color: white;
}

:deep(.p-inputtext:enabled:hover) {
    border-color: #2c3e50;
}

:deep(.p-inputtext::placeholder) {
    color: #6c757d;
}

:deep(.p-paginator) {
    background-color: white;
    border: none;
    padding: 1rem;
    color: #000000;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
    color: #000000;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    background-color: #4CAF50;
    color: #000000;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover) {
    background-color: #f8f9fa;
    color: #000000;
}

:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
    color: #000000;
}

:deep(.p-paginator .p-dropdown-label) {
    color: #000000;
}

:deep(.p-paginator .p-paginator-current) {
    color: #000000;
}

:deep(.search-input) {
    width: 100%;
    min-height: 42px;
}
</style>






