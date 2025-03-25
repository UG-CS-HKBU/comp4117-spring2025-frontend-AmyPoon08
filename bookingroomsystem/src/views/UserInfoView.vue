<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const users = ref([]);
const loading = ref(false);

const filters = ref({
    global: { value: null, matchMode: 'contains' },
    company: {value: null, matchMode: 'contains'},
    username: { value: null, matchMode: 'contains' },
    email: { value: null, matchMode: 'contains' },
    mobile: { value: null, matchMode: 'contains' },
});

const clearFilter = () => {
    filters.value = {
        global: { value: null, matchMode: 'contains' },
        company: {value: null, matchMode: 'contains'},
        username: { value: null, matchMode: 'contains' },
        email: { value: null, matchMode: 'contains' },
        mobile: { value: null, matchMode: 'contains' },
    };
};

const fetchUsers = async () => {
    try {
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok){
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        console.log(data)
        users.value = data;
    } catch (error) {
        console.error('Error fetching rooms:', error.message);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchUsers();
});

</script>

<template>

    <div class="card">
        <DataTable 
            v-model:filters="filters" 
            :value="users" 
            paginator 
            showGridlines 
            :rows="10" 
            dataKey="id"
            filterDisplay="menu" 
            :loading="loading"
            :globalFilterFields="['company','username','email','mobile']"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
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
                        @click="$router.push('/createUser')"
                    />
                </div>
            </template>

            <template #empty> No user found. </template>
            <template #loading> Loading users. Please wait. </template>

            <Column field="index" header="No." style="min-width: 5rem">
                <template #body="{ index }">
                    {{ index + 1 }}
                </template>
            </Column>

            <Column field="company" header="Company" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.company }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search by company"
                    />
                </template>
            </Column>

            <Column field="username" header="Username" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.username }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search by username"
                    />
                </template>
            </Column>

            <Column field="email" header="Email" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.email }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search by email"
                    />
                </template>
            </Column>

            <Column field="mobile" header="Mobile" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.mobile }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText 
                        v-model="filterModel.value" 
                        type="text" 
                        class="p-2 w-full" 
                        placeholder="Search by mobile"
                    />
                </template>
            </Column>

            <Column field="department" header="Department" style="min-width: 12rem"></Column>

            <Column header="" :exportable="false" style="min-width: 8rem">
                <template #body="slotProps">
                    <router-link 
                        :to="`/userdetails/${slotProps.data._id}`" 
                        class="p-button p-button-primary p-button-sm"
                    >
                        View
                    </router-link>
                </template>
            </Column>
        </DataTable>
    </div>
    
</template>