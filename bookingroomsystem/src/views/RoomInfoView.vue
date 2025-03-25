<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Select from 'primevue/select';

// const searchQuery = ref('');

const rooms = ref([]);
const loading = ref(false);

// Type options for filter
const types = [
    'Single Room',
    'Share Room',
];

// Category options for filter
const categories = [
    'Room 1',
    'Room 2',
    'Room 3',
    'Room 4',
    'Room 5',
];

// Initialize filters
const filters = ref({
    global: { value: null, matchMode: 'contains' },
    name: { value: null, matchMode: 'contains' },
    type: { value: null, matchMode: 'contains' },
    category: { value: null, matchMode: 'contains' },
});

const clearFilter = () => {
    filters.value = {
        global: { value: null, matchMode: 'contains' },
        name: { value: null, matchMode: 'contains' },
        type: { value: null, matchMode: 'contains' },
        category: { value: null, matchMode: 'contains' },
    };
};

const fetchRooms = async () => {
    try {
        const response = await fetch(`/api/rooms`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch rooms');
        }

        const data = await response.json();
        rooms.value = data;
    } catch (error) {
        console.error('Error fetching rooms:', error.message);
    } finally {
        loading.value = false;
    }
};


onMounted(() => {
    fetchRooms();
});

</script>

<template>

<div class="card">
        <DataTable 
            v-model:filters="filters" 
            :value="rooms" 
            paginator 
            showGridlines 
            :rows="10" 
            dataKey="id"
            filterDisplay="menu" 
            :loading="loading"
            :globalFilterFields="['name','type','category']"
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

                    <Button 
                        type="button" 
                        label="Add" 
                        class="p-button-text no-underline"
                        @click="$router.push('/createRoom')"
                    />
                </div>
            </template>

            <template #empty> No room found. </template>
            <template #loading> Loading rooms. Please wait. </template>

            <Column field="index" header="No." style="min-width: 5rem">
                <template #body="{ index }">
                    {{ index + 1 }}
                </template>
            </Column>

            <Column field="name" header="Name" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.name }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search by name"
                    />
                </template>
            </Column>

            <Column field="type" header="Type" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.type }}
                </template>
                <template #filter="{ filterModel }">
                    <Select 
                        v-model="filterModel.value" 
                        :options="types" 
                        placeholder="Select type" 
                        class="p-2 w-full" 
                        :showClear="true"
                    >
                        <template #option="slotProps">
                            <Tag :value="slotProps.option"/>
                        </template>
                    </Select>
                </template>
            </Column>

            <Column field="category" header="Category" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.category }}
                </template>
                <template #filter="{ filterModel }">
                    <Select 
                        v-model="filterModel.value" 
                        :options="categories" 
                        placeholder="Select category" 
                        class="p-2 w-full" 
                        :showClear="true"
                    >
                        <template #option="slotProps">
                            <Tag :value="slotProps.option"/>
                        </template>
                    </Select>
                </template>
            </Column>

            <Column field="capacity" header="Capacity" sortable style="min-width: 10rem"></Column>

            <Column field="price" header="Price" sortable style="min-width: 10rem"></Column>
            

            <Column header="" :exportable="false" style="min-width: 8rem">
                <template #body="slotProps">
                    <router-link 
                        :to="`/roomdetails/${slotProps.data._id}`" 
                        class="p-button p-button-primary p-button-sm"
                    >
                        View
                    </router-link>
                </template>
            </Column>
        </DataTable>
    </div>

    






    <!-- <div class="row mt-3">
        <div class="col-md-4">
            <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control" 
                placeholder="Search..."
            />
        </div>

        <div class="col-3 ms-auto">
            <button class="btn btn-primary w-100">
                <a href="/createRoom" class="text-white">Add</a>
            </button>
        </div>
    </div> -->
</template>