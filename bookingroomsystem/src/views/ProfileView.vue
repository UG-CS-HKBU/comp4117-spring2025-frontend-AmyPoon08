<script setup>
    import { ref, onMounted } from 'vue';

    const profile = ref({
    company: '',
    username: '',
    email: '',
    mobile: '',
    department: ''
    });

    const isEditing = ref(false);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please log in.');
            }

            const response = await fetch('/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Pass the token in the Authorization header
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in again.');
                } else if (response.status === 403) {
                    throw new Error('Forbidden: Invalid token.');
                } else if (response.status === 404) {
                    throw new Error('User profile not found.');
                } else {
                    throw new Error('Failed to fetch profile. Server responded with status: ' + response.status);
                }
            }

            const data = await response.json();
            profile.value = data; // Assuming `profile` is a reactive variable
            console.log('Profile fetched successfully:', data);
        } catch (error) {
            console.error('Error fetching profile:', error.message);
        }
    };

    const saveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please log in.');
            }

            const response = await fetch(`/api/users/${profile.value._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(profile.value)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in again.');
                } else if (response.status === 403) {
                    throw new Error('Forbidden: Invalid token.');
                } else {
                    throw new Error('Failed to save profile. Server responded with status: ' + response.status);
                }
            }

            const data = await response.json();
            profile.value = data; // Assuming `profile` is a reactive variable
            console.log('Profile saved successfully:', data);
            isEditing.value = false;
        } catch (error) {
            console.error('Error saving profile:', error.message);
        }
    };

    onMounted(() => {
        fetchProfile();
    });


</script>

<template>

  <div>
    <h1>Profile</h1>

    <div v-if="isEditing">
      <div>
        <label>Company:</label>
        <input v-model="profile.company" />
      </div>
      <div>
        <label>Username:</label>
        <input v-model="profile.username" />
      </div>
      <div>
        <label>Email:</label>
        <input v-model="profile.email" />
      </div>
      <div>
        <label>Mobile:</label>
        <input v-model="profile.mobile" />
      </div>
      <div>
        <label>Department:</label>
        <input v-model="profile.department" />
      </div>
      <button @click="saveProfile">Save</button>
      <button @click="isEditing = false">Cancel</button>
    </div>

    <div v-else>
      <p><strong>Company:</strong> {{ profile.company }}</p>
      <p><strong>Username:</strong> {{ profile.username }}</p>
      <p><strong>Email:</strong> {{ profile.email }}</p>
      <p><strong>Mobile:</strong> {{ profile.mobile }}</p>
      <p><strong>Department:</strong> {{ profile.department }}</p>
      <button @click="isEditing = true">Edit</button>
    </div>
  </div>

</template>