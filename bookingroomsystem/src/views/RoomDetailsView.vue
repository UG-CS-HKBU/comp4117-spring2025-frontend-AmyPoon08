<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from "vue-router";
import Button from 'primevue/button';

const route = useRoute();

const room = ref({});

const fetchRoom = async () => {
    try {
        const roomId = route.params.id;
        // Check if there's an ID in the route params
        if (roomId) {
            const response = await fetch(`/api/rooms/${roomId}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            
            const data = await response.json();
            console.log(data);
            
            room.value = {
                ...data, 
            };
        }
    } catch (err) {
        console.error('Failed to fetch room data:', err);
    }
};

const isAdmin = computed(() => localStorage.getItem('admin') === 'on');

 

onMounted(() => {
    fetchRoom();
});

</script>


<template>
    <div>
        <div class="row">
            <div class="col-md-4 image-column">
                <div class="image-container">
                    <img 
                        v-if="room.imageUrl" 
                        :src="room.imageUrl" 
                        :alt="room.name"
                        class="room-image"
                        @error="handleImageError"
                    />
                </div>
            </div>
            <div class="room-info">
                <div class="room-name-location">
                    <p class="card-title font-weight-bold">{{ room.name }} @ {{ room.location }}</p>
                </div>

                <div class="row">
                    <div class="col-2 room-type">
                        <p class="card-text">{{ room.type }}</p>
                    </div>
                    <div class="col-2 room-category">
                        <p class="card-text">{{ room.category }}</p>
                    </div>
                </div>
                
                <div class="room-description">
                    <p class="card-text" style="color:steelblue">{{ room.description }}</p>
                </div>
                <div class="room-capacity">
                    <p class="card-text">Room Capacity: {{ room.capacity }}</p>
                </div>
                <div class="room-price">
                    <p class="card-text" style="color:slategrey">Price per hour: ${{ room.price }}</p>
                </div>
                <div class="room-additional-price">
                    <p class="card-text" style="color:slategrey">Additional Price per Participant: ${{ room.additional_price_per_participant }}</p>
                </div>

                <div v-if="isAdmin" style="display: flex; justify-content: flex-end; margin-top: 20px;">
                    <Button 
                        type="button" 
                        label="Edit" 
                        class="no-underline"
                        @click="$router.push(`/rooms/${room._id}/edit`)"
                        raised 
                    />
                </div>
            </div>
            
        </div>
    </div>

</template>

<style scoped>

.image-column {
    flex: 1;
    max-width: 33.33%;
    padding: 10px;
}

.image-container {
  width: 100%;
  height: 0;
  padding-bottom: 75%; 
  position: relative;
  margin: 10px;
}

.room-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px
}

.main{
    flex: 1;
    padding-left: 50px;
}
.room-info{
    flex: 1;
    padding: 20px;

}
/* Room Name */
.room-name-location {
    font-size: 2.5rem; /* Adjust font size for better readability */
    font-weight: bold;
    margin-bottom: 20px;
    color: #333; /* Darker color for better contrast */
}

/* Room Type and Category */
.room-type,
.room-category {
    font-size: 1.7rem;
    margin-bottom: 15px;
    color: #555; 
}

/* Room Description */
.room-description {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: steelblue;
    line-height: 1.5; /* Improve readability */
}

/* Room Capacity and Location */
.room-capacity {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #555;
}

/* Room Price and Additional Price */
.room-price,
.room-additional-price {
    font-size: 1rem;
    margin-bottom: 10px;
    color: slategrey;
}

/* Responsive Design */
@media (max-width: 768px) {
    .image-column {
        max-width: 100%; /* Make the image column full width on smaller screens */
        margin-bottom: 20px;
    }

    .room-info {
        padding: 15px;
    }

    .room-name {
        font-size: 1.5rem;
    }

    .room-type,
    .room-category,
    .room-description,
    .room-capacity,
    .room-location,
    .room-price,
    .room-additional-price {
        font-size: 0.9rem;
    }
}

/* .room-name{
    font-size: 50px;
    font-weight: bold;
    padding-bottom: 60px;
    padding: 10px;
}


.room-description{
    font-size: 25px;
    padding-bottom: 30px;
    padding: 10px;
}

.room-price, .room-additional-price{
    padding: 10px;
} */

</style>
