<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';
import Select from 'primevue/select';

const bookingRecords = ref([]);
const loading = ref(false);

// Status options for filter
const statuses = [
    'pending payment',
    'pending approval',
    'confirmed'
];

// Initialize filters
const filters = ref({
    global: { value: null, matchMode: 'contains' },
    bookingId: { value: null, matchMode: 'contains' },
    roomName: { value: null, matchMode: 'contains' },
    date: { value: null, matchMode: 'dateIs' },
    status: { value: null, matchMode: 'equals' }
});

const clearFilter = () => {
    filters.value = {
        global: { value: null, matchMode: 'contains' },
        bookingId: { value: null, matchMode: 'contains' },
        roomName: { value: null, matchMode: 'contains' },
        date: { value: null, matchMode: 'dateIs' },
        status: { value: null, matchMode: 'equals' }
    };
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
};

const getStartTime = (timeslots) => {
    if (!timeslots || timeslots.length === 0) return '-';
    return timeslots[0];
};

const getEndTime = (timeslots) => {
    if (!timeslots || timeslots.length === 0) return '-';
    return timeslots[timeslots.length - 1];
};

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

const fetchBookingRecords = async () => {
    try {
        loading.value = true;
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please log in.');
        }

        const response = await fetch('/api/bookings', {
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
        bookingRecords.value = data;
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchBookingRecords();
});
</script>

<template>
    <div class="card">
        <DataTable 
            v-model:filters="filters" 
            :value="bookingRecords" 
            paginator 
            showGridlines 
            :rows="10" 
            dataKey="id"
            filterDisplay="menu" 
            :loading="loading"
            :globalFilterFields="['bookingId', 'roomName','date']"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} bookings"
        >

            <template #header>
                <div class="flex items-center gap-4">
                    <div class="flex-grow">
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search..." class="w-full"/>
                        </span>
                    </div>
                    <Button 
                        type="button" 
                        label="Clear All Filters" 
                        class="p-button-text"
                        @click="clearFilter()"
                    />
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
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search booking ID"
                    />
                </template>
            </Column>

            <Column field="userName" header="Username" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.username }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search booking ID"
                    />
                </template>
            </Column>

            <Column field="roomName" header="Room" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.roomName }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search room"
                    />
                </template>
            </Column>

            <Column field="date" header="Date" sortable dataType="date" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatDate(data.date) }}
                </template>
                <template #filter="{ filterModel }">
                    <Calendar 
                        v-model="filterModel.value" 
                        dateFormat="dd/mm/yy" 
                        placeholder="Select date" 
                        class="p-2 w-full"
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
                    <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
                </template>
                <template #filter="{ filterModel }">
                    <Select 
                        v-model="filterModel.value" 
                        :options="statuses" 
                        placeholder="Select Status" 
                        class="p-2 w-full" 
                        :showClear="true"
                    >
                        <template #option="slotProps">
                            <Tag :value="slotProps.option" :severity="getStatusSeverity(slotProps.option)" />
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
</template>

<style scoped>
:deep(.p-datatable-header) {
    background-color: #f8f9fa;
    padding: 1rem;
}

:deep(.p-column-filter) {
    width: 100%;
}

:deep(.p-calendar) {
    width: 100%;
}

:deep(.p-dropdown) {
    width: 100%;
}
</style>





