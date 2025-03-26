<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const users = ref([]);
const loading = ref(false);
const deleteDialog = ref(false);
const userToDelete = ref(null);
const toast = useToast();

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

const confirmDeleteUser = (user) => {
    userToDelete.value = user;
    deleteDialog.value = true;
};

const deleteUser = async () => {
    if (!userToDelete.value) return;
    
    try {
        loading.value = true;
        const response = await fetch(`/api/users/${userToDelete.value._id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        // Remove the user from the list
        users.value = users.value.filter(user => user._id !== userToDelete.value._id);
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `User ${userToDelete.value.username} deleted successfully`,
            life: 3000
        });
        
        deleteDialog.value = false;
        userToDelete.value = null;
    } catch (error) {
        console.error('Error deleting user:', error.message);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete user',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchUsers();
});

</script>

<template>
    <div>
        <Toast position="top-right" />
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
                    <div class="flex items-center justify-between w-full">
                        <h2 class="text-xl font-semibold m-0">User Info.</h2>
                        <div class="flex items-center gap-2 ml-auto">
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Keyword Search..." />
                            </span>
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

                <Column header="Actions" :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <div class="flex gap-4 justify-between">
                            <router-link 
                                :to="`/userdetails/${slotProps.data._id}`" 
                                class="p-button p-button-primary p-button-sm mr-2"
                            >
                                View
                            </router-link>
                            <Button 
                                type="button" 
                                class="p-button p-button-danger p-button-sm ml-2"
                                @click="confirmDeleteUser(slotProps.data)"
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
                <span v-if="userToDelete">Are you sure you want to delete user <b>{{ userToDelete.username }}</b>?</span>
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
                    @click="deleteUser" 
                    :loading="loading" 
                />
            </template>
        </Dialog>
    </div>
</template>