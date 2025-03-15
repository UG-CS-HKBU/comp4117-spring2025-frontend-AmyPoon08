<script setup>
import { ref } from 'vue';
const searchQuery = ref('');

</script>

<template>
    <div class="row mt-3">
        <div class="col-md-4">
            <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control" 
                placeholder="Search..."
            />
        </div>

        <!-- Create new room -->
        <div class="col-3 ms-auto">
            <button class="btn btn-primary w-100">
                <a href="/createRoom" class="text-white">Add</a>
            </button>
        </div>
    </div>
</template>