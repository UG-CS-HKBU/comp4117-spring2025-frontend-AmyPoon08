<script setup>
import { RouterView, useRouter } from 'vue-router'
import { ref, provide, onMounted, watch } from 'vue'
import config from './config'

const router = useRouter();
const isAuthenticated = ref(false);
const isAdmin = ref(false);
const menuOpen = ref(false); // Add this to control mobile menu
const userName = ref({ username: '' }); // Initialize with empty username
const isLoading = ref(true); // Add loading state

const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
}

const logout = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log("Starting logout with token:", token); // Debug log

        if (token) {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // Important for CORS
                });

                console.log("Logout response:", response); // Debug log

                if (!response.ok) {
                    console.warn(`Logout request failed with status: ${response.status}`);
                    const errorText = await response.text();
                    console.warn('Error details:', errorText);
                }
            } catch (fetchError) {
                console.error('Fetch error during logout:', fetchError);
            }
        }

        // Clear local storage regardless of server response
        localStorage.clear(); // Clear all items
        isAuthenticated.value = false;
        isAdmin.value = false;
        
        // Redirect to login page
        router.push('/');
    } catch (error) {
        console.error('Error during logout:', error);
        // Clear local storage even if there's an error
        localStorage.clear();
        router.push('/');
    }
};


const fetchIsAdmin = async () => {
    try {
        const adminStatus = localStorage.getItem('admin');
        // Parse the stored value back to boolean if it's a boolean string
        if (adminStatus === 'true' || adminStatus === 'false') {
            isAdmin.value = JSON.parse(adminStatus);
        } else {
            // Handle 'on' string case
            isAdmin.value = adminStatus === 'on';
        }
        console.log('Admin status:', {
            rawValue: adminStatus,
            isAdmin: isAdmin.value
        });
    } catch (error) {
        console.error('Error during fetchIsAdmin:', error.message);
        isAdmin.value = false;
    }
};

// const fetchName = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         throw new Error('No token found');
//     }

//     try {
//         const response = await fetch('https://roombookingsystem-etc7bfeeg8hndfbc.eastasia-01.azurewebsites.net/api/profile', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         if (!response.ok) {
//             if (response.status === 401) {
//                 // Token expired or invalid
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw new Error('Session expired, please login again');
//             }
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error('Failed to fetch profile:', error);
//         if (error.message.includes('Session expired')) {
//             localStorage.clear();
//             window.location.href = '/login';
//         }
//         throw error;
//     }
// };

const fetchName = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        const response = await fetch(`${config.apiBaseUrl}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Unauthorized: Token expired or invalid');
                localStorage.removeItem('token');
                isAuthenticated.value = false;
                router.push('/');
                return;
            } else {
                console.warn(`Failed to fetch profile: ${response.status}`);
                return;
            }
        }

        const data = await response.json();
        userName.value = data;
    } catch (error) {
        console.warn('Error fetching profile:', error.message);
    } finally {
        isLoading.value = false;
    }
};

const showNav = ref(true); // Control nav visibility

const hideNav = () => {
    showNav.value = false;
}

const showNavBar = () => {
    showNav.value = true;
}

provide('auth', {
    isAuthenticated,
    hideNav,
    showNavBar
})

watch(isAuthenticated, (newValue) => {
    if (newValue) {
        showNavBar();
        fetchName();
        fetchIsAdmin();
    } else {
        hideNav();
    }
});

onMounted(() => {
    const token = localStorage.getItem('token');
    isAuthenticated.value = !!token;
    
    if (isAuthenticated.value) {
        fetchName();
        fetchIsAdmin();
    } else {
        isLoading.value = false; // Not authenticated, not loading
    }
});
</script>

<template>
    <div class="page-container">
        <!-- Users nav bar -->
        <nav v-if="isAuthenticated && !isAdmin && !isLoading" class="menubar">
            <!-- Left side with logo and navigation -->
            <div class="nav-left">
                <a href="/home" class="logo-link">
                    <img src="./images/AboutUs.jpg" alt="KOJU by tronico" class="nav-logo" />
                </a>
                <!-- Navigation links on left -->
                <div class="nav-links">
                    <a href="/bookings">Bookings</a>
                    <a href="/myBookings">My Bookings</a>
                    <a href="/profile">Profile</a>
                    <a href="/AboutUs">About us</a>
                </div>
            </div>
            
            <!-- Right side with welcome and logout -->
            <div class="nav-right">
                <span class="welcome-text">Welcome, {{ userName.username }}</span>
                <a href="#" class="logout-btn" @click="logout">Logout</a>
            </div>
            
            <!-- Mobile menu button -->
            <div class="hamburger" @click="toggleMenu">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <!-- Mobile menu -->
            <div class="mobile-menu" :class="{ 'open': menuOpen }">
                <div class="welcome-mobile">Welcome, {{ userName.username }}</div>
                <a href="/bookings" @click="menuOpen = false">Bookings</a>
                <a href="/myBookings" @click="menuOpen = false">My Bookings</a>
                <a href="/profile" @click="menuOpen = false">Profile</a>
                <a href="/AboutUs" @click="menuOpen = false">About us</a>
                <a href="#" @click="logout(); menuOpen = false" class="mobile-logout">Logout</a>
            </div>
        </nav>
        
        <!-- Admin nav bar -->
        <nav v-if="isAuthenticated && isAdmin && !isLoading" class="menubar">
            <!-- Left side with logo and navigation -->
            <div class="nav-left">
                <a href="/home" class="logo-link">
                    <img src="./images/AboutUs.jpg" alt="KOJU by tronico" class="nav-logo" />
                </a>
                <!-- Admin navigation links on left -->
                <div class="nav-links">
                    <a href="/rooms">Room Information</a>
                    <a href="/users">User Information</a>
                    <a href="/BookingRecords">Booking Record</a>
                    <a href="/profile">Profile</a>
                    <a href="/AboutUs">About us</a>
                </div>
            </div>
            
            <!-- Right side with welcome and logout -->
            <div class="nav-right">
                <span class="welcome-text">Welcome, {{ userName.username }}</span>
                <a href="#" class="logout-btn" @click="logout">Logout</a>
            </div>
            
            <!-- Mobile menu button -->
            <div class="hamburger" @click="toggleMenu">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <!-- Mobile menu -->
            <div class="mobile-menu" :class="{ 'open': menuOpen }">
                <div class="welcome-mobile">Welcome, {{ userName.username }}</div>
                <a href="/rooms" @click="menuOpen = false">Room Information</a>
                <a href="/users" @click="menuOpen = false">User Information</a>
                <a href="/BookingRecords" @click="menuOpen = false">Booking Record</a>
                <a href="/profile" @click="menuOpen = false">Profile</a>
                <a href="/AboutUs" @click="menuOpen = false">About us</a>
                <a href="#" @click="logout(); menuOpen = false" class="mobile-logout">Logout</a>
            </div>
        </nav>

        <div class="main-content">
            <RouterView />
        </div>

        <!-- Compact Footer -->
        <footer class="app-footer">
            <div class="footer-content">
                <!-- Mobile Footer -->
                <div class="mobile-footer">
                    <div class="footer-logo">
                        <img src="./images/AboutUs.jpg" alt="KOJU by tronico" class="logo-image" />
                    </div>
                    <div class="footer-links">
                        <router-link to="/aboutUs">About us</router-link>
                        <router-link to="/bookings">Bookings</router-link>
                    </div>
                    <div class="copyright">
                        Room Booking System © 2025
                    </div>
                    <div class="contact-mobile">
                        <a href="mailto:koju@tronico.com.hk">koju@tronico.com.hk</a>
                    </div>
                </div>
                
                <!-- Desktop Footer -->
                <div class="desktop-footer">
                    <div class="footer-left">
                        <div class="footer-logo">
                            <img src="./images/AboutUs.jpg" alt="KOJU by tronico" class="logo-image" />
                        </div>
                        <div class="copyright">
                            Room Booking System © 2025 - Comp4117 Group C Project
                        </div>
                    </div>
                    
                    <div class="footer-middle">
                        <div class="address-section">
                            <h4>HK Headquarter</h4>
                            <p>Unit 219, 2/F, 16 Science Park West Avenue, Shatin, HK</p>
                        </div>
                    </div>
                    
                    <div class="footer-right">
                        <div class="footer-links">
                            <router-link to="/aboutUs">About us</router-link>
                            <router-link to="/bookings">Bookings</router-link>
                        </div>
                        <div class="contact-info">
                            <p>TRONICO TECHNOLOGY CO. LTD. (852) 9667 7650</p>
                            <p><a href="mailto:koju@tronico.com.hk">koju@tronico.com.hk</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
/* Base container styles */
.page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-content {
    flex: 1;
    position: relative;
    z-index: 1;
    margin-bottom: 0; /* No margin as footer is now compact */
}

/* Navbar styles */
.menubar {
    position: sticky;
    top: 0;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 5rem; /* Fixed height as requested */
    padding: 0 1.5rem;
    background-color: #333;
    color: white;
}

/* Left side of navbar with logo and navigation */
.nav-left {
    display: flex;
    align-items: center;
    height: 100%;
    flex: 1;
}

.logo-link {
    display: flex;
    align-items: center;
    height: 100%;
    padding-right: 1.5rem;
}

.nav-logo {
    height: 3.5rem;
    width: auto;
    object-fit: contain;
}

.nav-links {
    display: flex;
    height: 100%;
    align-items: center;
}

.nav-links a {
    color: white;
    text-decoration: none;
    padding: 0 1rem;
    height: 100%;
    display: flex;
    align-items: center;
    transition: background-color 0.3s;
}

.nav-links a:hover {
    background-color: #444;
}

/* Right side with welcome and logout */
.nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 100%;
}

.welcome-text {
    font-weight: bold;
    color: white;
}

.logout-btn {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    transition: background-color 0.3s;
}

.logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

/* Mobile elements */
.hamburger {
    display: none;
    flex-direction: column;
    cursor: pointer;
    margin-left: 1rem;
}

.hamburger span {
    display: block;
    width: 25px;
    height: 3px;
    margin: 3px 0;
    background-color: white;
    border-radius: 2px;
}

.welcome-mobile {
    display: none;
    padding: 1rem;
    font-weight: bold;
    background-color: #444;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-menu {
    display: none;
    position: fixed;
    top: 5rem; /* Match navbar height */
    left: 0;
    width: 100%;
    height: 0;
    background-color: #333;
    overflow: hidden;
    transition: height 0.3s ease;
    z-index: 999;
    flex-direction: column;
}

.mobile-menu.open {
    height: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mobile-menu a {
    padding: 1rem 1.5rem;
    color: white;
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-menu a:hover {
    background-color: #444;
}

.mobile-logout {
    background-color: rgba(255, 255, 255, 0.1);
    margin-top: 0.5rem;
}

/* Footer styles - Compact Sticky Footer */
.app-footer {
    background-color: #f5f5f5;
    border-top: 1px solid #e0e0e0;
    width: 100%;
    position: sticky;
    bottom: 0;
    z-index: 10;
    font-size: 0.85rem;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
}

/* Desktop Footer */
.desktop-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 1rem;
}

.footer-left, .footer-middle, .footer-right {
    flex: 1;
}

.footer-logo {
    max-width: 100px;
    margin-bottom: 0.5rem;
}

.logo-image {
    width: 100%;
    height: auto;
}

.copyright {
    color: #666;
    font-size: 0.75rem;
}

.address-section {
    text-align: center;
}

.address-section h4 {
    margin: 0 0 0.3rem 0;
    font-size: 0.85rem;
    color: #333;
}

.address-section p {
    color: #666;
    line-height: 1.2;
    margin: 0;
}

.footer-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.footer-links {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.3rem;
}

.footer-links a {
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.footer-links a:hover {
    color: #4CAF50;
}

.contact-info {
    font-size: 0.75rem;
    color: #666;
    text-align: right;
}

.contact-info p {
    margin: 0.1rem 0;
}

.contact-info a {
    color: #4CAF50;
    text-decoration: none;
}

.contact-info a:hover {
    text-decoration: underline;
}

/* Mobile Footer */
.mobile-footer {
    display: none;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    text-align: center;
}

.mobile-footer .footer-logo {
    max-width: 80px;
    margin-bottom: 0.3rem;
}

.mobile-footer .footer-links {
    margin: 0.3rem 0;
}

.mobile-footer .copyright {
    margin: 0.3rem 0;
    width: 100%;
    font-size: 0.7rem;
}

.contact-mobile {
    font-size: 0.7rem;
}

.contact-mobile a {
    color: #4CAF50;
    text-decoration: none;
}

/* Responsive styles */
@media (max-width: 992px) {
    .nav-links a {
        padding: 0 0.8rem;
    }
    
    .welcome-text {
        font-size: 0.9rem;
    }
    
    .desktop-footer {
        padding: 0.5rem;
    }
    
    .footer-logo {
        max-width: 80px;
    }
    
    .address-section h4 {
        font-size: 0.8rem;
    }
    
    .address-section p, .contact-info p, .copyright {
        font-size: 0.7rem;
    }
    
    .footer-links a {
        font-size: 0.8rem;
    }
}

@media (max-width: 768px) {
    .menubar {
        padding: 0 1rem;
    }
    
    .nav-links {
        display: none;
    }
    
    .nav-right {
        display: none;
    }
    
    .hamburger {
        display: flex;
    }
    
    .mobile-menu {
        display: flex;
    }
    
    .welcome-mobile {
        display: block;
    }
    
    .nav-left {
        flex: 1;
        justify-content: center;
    }
    
    .logo-link {
        justify-content: center;
        padding-right: 0;
    }
    
    /* Switch footer styles for mobile */
    .desktop-footer {
        display: none;
    }
    
    .mobile-footer {
        display: flex;
    }
}

@media (max-width: 480px) {
    .menubar {
        padding: 0 0.8rem;
    }
    
    .nav-logo {
        height: 2.8rem;
    }
    
    /* Further simplify mobile footer */
    .mobile-footer {
        padding: 0.4rem;
    }
    
    .mobile-footer .footer-logo {
        max-width: 60px;
    }
    
    .mobile-footer .footer-links {
        flex-direction: row;
        gap: 0.8rem;
    }
    
    .mobile-footer .footer-links a {
        font-size: 0.75rem;
    }
    
    .mobile-footer .copyright, .contact-mobile {
        font-size: 0.65rem;
    }
}
</style>