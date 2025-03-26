<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

// const searchQuery = ref('');

const rooms = ref([]);
const loading = ref(false);
const deleteDialog = ref(false);
const roomToDelete = ref(null);
const toast = useToast();

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

const confirmDeleteRoom = (room) => {
    roomToDelete.value = room;
    deleteDialog.value = true;
};

const deleteRoom = async () => {
    if (!roomToDelete.value) return;
    
    try {
        loading.value = true;
        const response = await fetch(`/api/rooms/${roomToDelete.value._id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete room');
        }

        // Remove the room from the list
        rooms.value = rooms.value.filter(room => room._id !== roomToDelete.value._id);
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Room ${roomToDelete.value.name} deleted successfully`,
            life: 3000
        });
        
        deleteDialog.value = false;
        roomToDelete.value = null;
    } catch (error) {
        console.error('Error deleting room:', error.message);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete room',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchRooms();
});

</script>

<template>
<div>
    <Toast position="top-right" />
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
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} rooms"
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
            

            <Column header="Actions" :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <div class="flex gap-4 justify-between">
                        <router-link 
                            :to="`/roomdetails/${slotProps.data._id}`" 
                            class="p-button p-button-primary p-button-sm mr-2"
                        >
                            View
                        </router-link>
                        <Button 
                            type="button" 
                            class="p-button p-button-danger p-button-sm ml-2"
                            @click="confirmDeleteRoom(slotProps.data)"
                        >
                            Delete
                        </Button>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <Dialog 
        v-model:visible="deleteDialog" 
        header="Confirm Delete" 
        :modal="true"
        :style="{ width: '450px' }" 
        :closable="false"
    >
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="roomToDelete">Are you sure you want to delete room <b>{{ roomToDelete.name }}</b>?</span>
        </div>
        <template #footer>
            <Button 
                label="No" 
                icon="pi pi-times" 
                class="p-button-text" 
                @click="deleteDialog = false" 
            />
            <Button 
                label="Yes" 
                icon="pi pi-check" 
                class="p-button-danger" 
                @click="deleteRoom" 
                :loading="loading" 
            />
        </template>
    </Dialog>
</div>
</template>