import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import AboutUsView from '../views/AboutUsView.vue'
import CreateNewRoomView from '../views/CreateNewRoomView.vue'
import BookingsView from '../views/BookingsView.vue'
import BookView from '../views/BookView.vue'
import RoomInfoView from '../views/RoomInfoView.vue'
import BookingRecordView from '../views/BookingRecordView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/aboutus',
      name: 'AboutUs',
      component: AboutUsView,
    },
    {
      path: '/bookings',
      name: 'Bookings',
      component: BookingsView,
    },
    {
      path: '/bookings/book/:id',
      name: 'RoomBooking',
      component: BookView,
    },
    {
      path: '/bookingRecord',
      name: 'BookingRecord',
      component: BookingRecordView,
    },

    // Admin routes
    {
      path: '/rooms',
      name: 'RoomInformation',
      component: RoomInfoView,
    },
    {
      path: '/createRoom',
      name: 'CreateNewRoom',
      component: CreateNewRoomView,
    },
  ],
})

export default router
