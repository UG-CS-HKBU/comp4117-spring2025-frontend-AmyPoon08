import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import AboutUsView from '../views/AboutUsView.vue'
import CreateNewRoomView from '../views/CreateNewRoomView.vue'
import BookingsView from '../views/BookingsView.vue'
import BookView from '../views/BookView.vue'
import RoomInfoView from '../views/RoomInfoView.vue'
import RoomEdit from '../views/RoomEdit.vue'
import MyBookingsView from '../views/MyBookingsView.vue'
import BookingDetailsView from '../views/BookingDetailsView.vue'
import PaymentView from '../views/PaymentView.vue'
import RoomDetailsView from '@/views/RoomDetailsView.vue'
import UserInfoView from '@/views/UserInfoView.vue'
import UserDetailsView from '@/views/UserDetailsView.vue'
import CreateUserView from '@/views/CreateUserView.vue'
import BookingRecordsView from '@/views/BookingRecordsView.vue' 

function isAuthenticated() {
  const token = localStorage.getItem('token')
  return !!token
}

function isAdmin() {
  const adminStatus = localStorage.getItem('admin')
  console.log('Admin check in router:', adminStatus)
  return adminStatus === 'on'
}

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
      path: '/payment/:bookingId',
      name: 'Payment',
      component: PaymentView,
      props: true 
    },
    {
      path: '/myBookings',
      name: 'MyBookings',
      component: MyBookingsView,
    },
    {
      path: '/bookingHistory/:id',
      name: 'BookingDetails',
      component: BookingDetailsView,
    },
    {
      path: '/roomDetails/:id',
      name: 'RoomDetails',
      component: RoomDetailsView,
    },

    // Admin routes
    {
      path: '/rooms',
      name: 'RoomInformation',
      component: RoomInfoView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/createRoom',
      name: 'CreateNewRoom',
      component: CreateNewRoomView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/rooms/:id/edit",
      name: "EditRoom",
      component: RoomEdit,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/users",
      name: "UserInformation",
      component: UserInfoView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/userdetails/:id",
      name: "UserDetails",
      component: UserDetailsView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/createUser",
      name: "CreateUser",
      component: CreateUserView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/bookingRecords",
      name: "BookingRecords",
      component: BookingRecordsView,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
    
  ]
})


router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  console.log('Route requires auth:', requiresAuth)
  console.log('Route requires admin:', requiresAdmin)
  console.log('Is authenticated:', isAuthenticated())
  console.log('Is admin:', isAdmin())

  if (requiresAuth && !isAuthenticated()) {
    console.log('Redirecting to login - not authenticated')
    next({
      path: '/',
      query: { redirect: to.fullPath }
    })
    return
  }

  if (requiresAdmin && !isAdmin()) {
    console.log('Redirecting to home - not admin')
    next('/home')
    return
  }

  console.log('Proceeding to route:', to.path)
  next()
})


export default router
