<template>
  <div class="home-view mt-5">
    <div class="carousel-container">
      <TopRoomsCarousel />
    </div>
    <div class="calendar-container">
      <div class="monthly-view">
        <FullCalendar :options="calendarOptions" />
      </div>
      <div class="day-view">
        <FullCalendar :options="dayViewOptions" />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import TopRoomsCarousel from './TopRoomsCarousel.vue';
import config from '../config';


export default {
  name: 'HomeView',
  components: {
    FullCalendar,
    TopRoomsCarousel
  },
  setup() {
    const bookingData = ref([]);
    const rooms = ref([]);

    // Fetch all rooms
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/rooms`);
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const data = await response.json();
        rooms.value = data;
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    // Fetch confirmed bookings
    const fetchConfirmedBookings = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/bookings`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        
        // Filter only confirmed bookings
        const confirmedBookings = data.filter(booking => booking.status === 'confirmed');
        
        // Transform bookings into calendar events format
        bookingData.value = rooms.value.map(room => ({
          id: room._id,
          name: room.name,
          events: confirmedBookings
            .filter(booking => booking.roomId === room._id)
            .map(booking => ({
              id: booking._id,
              title: room.name, // Only show room name
              start: createEventDateTime(booking.date, booking.timeslots[0]),
              end: createEventEndDateTime(booking.date, booking.timeslots[booking.timeslots.length - 1])
            }))
        }));

        // Update calendar options with new data
        updateCalendarOptions();
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    // Helper function to create event datetime
    const createEventDateTime = (date, time) => {
      return `${date}T${time}`;
    };

    // Helper function to create event end datetime
    const createEventEndDateTime = (date, time) => {
      const [hour, minute] = time.split(':').map(Number);
      return `${date}T${hour.toString().padStart(2, '0')}:59`;
    };

    const hideLicenseMessage = () => {
      const licenseMessage = document.querySelector('.fc-license-message');
      if (licenseMessage) {
        licenseMessage.style.display = 'none';
      }
    };

    const calendarOptions = ref({
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      events: [],
      eventDidMount: hideLicenseMessage
    });

    const dayViewOptions = ref({
      plugins: [resourceTimeGridPlugin, resourceTimelinePlugin],
      initialView: 'resourceTimeGridDay',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimelineDay'
      },
      resourceAreaColumns: [
        {
          field: 'title',
          headerContent: 'Room'
        }
      ],
      resources: [],
      events: [],
      eventDidMount: hideLicenseMessage
    });

    // Update calendar options with new data
    const updateCalendarOptions = () => {
      // Update month view events
      calendarOptions.value.events = bookingData.value.flatMap(room =>
        room.events.map(event => ({
          title: room.name, // Only show room name
          start: event.start,
          end: event.end
        }))
      );

      // Update day view resources and events
      dayViewOptions.value.resources = bookingData.value.map(room => ({
        id: room.id,
        title: room.name
      }));

      dayViewOptions.value.events = bookingData.value.flatMap(room =>
        room.events.map(event => ({
          resourceId: room.id,
          title: room.name, // Only show room name
          start: event.start,
          end: event.end
        }))
      );
    };

    // Initialize data
    onMounted(async () => {
      await fetchRooms();
      await fetchConfirmedBookings();
      hideLicenseMessage();
    });

    return {
      calendarOptions,
      dayViewOptions
    };
  },
};

</script>

<style>

.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.carousel-container {
  width: 100%;
  margin-bottom: 20px;
}

.calendar-container {
  display: flex;
  width: 95%;
  margin: 0 auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
}

.monthly-view,
.day-view {
  flex: 1;
  padding: 10px;
}
</style>