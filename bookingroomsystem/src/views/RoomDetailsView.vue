<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from "vue-router";

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

 

onMounted(() => {
    fetchRoom();
});

</script>


<template>
    <div>
        <h1>Room Details</h1>
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
                    <div class="room-name">
                        <p class="card-title font-weight-bold">{{ room.name }}</p>
                    </div>
                    <div class="room-description">
                        <p class="card-text" style="color:steelblue">{{ room.description }}</p>
                    </div>
                    <div class="room-price">
                        <p class="card-text" style="color:slategrey">Price per hour: ${{ room.price }}</p>
                    </div>
                    <div class="room-additional-price">
                        <p class="card-text" style="color:slategrey">Additional Price per Participant: ${{ room.additional_price_per_participant }}</p>
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
}

.room-name{
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
}

</style>
