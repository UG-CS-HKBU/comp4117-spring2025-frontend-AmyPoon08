<template>
  <div class="home-view mt-5">
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

export default {
  name: 'HomeView',
  components: {
    FullCalendar
  },
  setup() {

    // Test book room data for the calendar
    const testBookData = ref([
      {
        id: 1,
        name: 'Room 1',
        events: [
          {
            id: 1,
            title: 'Meeting 1',
            start: '2025-03-08T06:00:00',
            end: '2025-03-08T12:00:00'
          },
          {
            id: 2,
            title: 'Conference 1',
            start: '2025-03-15T09:00:00',
            end: '2025-03-15T17:00:00'
          }
        ]
      },
      {
        id: 2,
        name: 'Room 2',
        events: [
          {
            id: 3,
            title: 'Meeting 2',
            start: '2025-03-08T10:00:00',
            end: '2025-03-08T11:00:00'
          },
          {
            id: 4,
            title: 'Conference ',
            start: '2025-03-10T09:00:00',
            end: '2025-03-10T12:00:00'
          }
        ]
      },
      {
        id: 3,
        name: 'Room 3',
        events: [
          {
            id: 4,
            title: 'Meeting 3',
            start: '2025-03-08T10:00:00',
            end: '2025-03-08T11:00:00'
          },
          {
            id: 5,
            title: 'Conference ',
            start: '2025-03-10T09:00:00',
            end: '2025-03-10T12:00:00'
          }
        ]
      }
    ]);

    const hideLicenseMessage = () => {
      const licenseMessage = document.querySelector('.fc-license-message');
      if (licenseMessage) {
        licenseMessage.style.display = 'none';
      }
    };

    const calendarOptions = ref({
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      events: testBookData.value.flatMap(room =>
        room.events.map(event => ({
          title: `${room.name} - ${event.title}`,
          start: event.start,
          end: event.end
        }))
      ),
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
        }],
      resources: testBookData.value.map(room => ({
        id: room.id,
        title: room.name
      })),
      events: testBookData.value.flatMap(room =>
        room.events.map(event => ({
          resourceId: room.id,
          title: `${room.name} - ${event.title}`,
          start: event.start,
          end: event.end
        }))
      ),
      eventDidMount: hideLicenseMessage
    });

    onMounted(() => {
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
  flex-direction: row;
}

.calendar-container {
  display: flex;
  width: 100%;
}

.monthly-view,
.day-view {
  flex: 1;
  padding: 10px;
}
</style>