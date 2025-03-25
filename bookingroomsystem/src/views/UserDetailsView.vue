<script setup>
import Button from 'primevue/button';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from "vue-router";


const route = useRoute();
const router = useRouter();

const user = ref({});

const fetchUser = async () => {
    try {
        const userId = route.params.id;
        if (userId){
            const response = await fetch(`/api/users/${userId}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            user.value = data;
        }
    } catch (err) {
        console.error('Failed to fetch user data:', err);
    }
}

const isAdmin = computed(() => localStorage.getItem('admin') === 'on');

onMounted(() => {
    fetchUser();
});

</script>

<template>
    <div class="userInfo">
        <div class="username">
            <p class="card-title font-weight-bold">Username: {{ user.username }}</p>
        </div>

        <div class="company">
            <p class="card-text">Company: {{ user.company }}</p>
        </div>
        <div class="department">
            <p class="card-text">Department: {{ user.department }}</p>
        </div>
        <div class="email">
            <p class="card-text">Email: {{ user.email }}</p>
        </div>
        <div class="mobile">
            <p class="card-text">Mobile: {{ user.mobile }}</p>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 20px; gap: 10px;">
            <Button 
                v-if="isAdmin"
                type="button" 
                label="Edit" 
                class="no-underline"
                @click="$router.push(`/users/${user._id}/edit`)"
            />
            <Button 
                type="button" 
                label="Back" 
                class="no-underline"
                @click="router.go(-1)"
            />
        </div>
    </div>

    
</template>

<style scoped>
.userInfo{
    flex: 1;
    padding: 20px;

}
.username {
    font-size: 2.5rem; /* Adjust font size for better readability */
    font-weight: bold;
    margin-bottom: 20px;
    color: #333; /* Darker color for better contrast */
}

.company,
.department,
.email,
.mobile{
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: steelblue;
    line-height: 1.5;
}
</style>