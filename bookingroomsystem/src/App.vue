<script setup>
import { RouterView, useRouter } from 'vue-router'
import { ref, provide, onMounted, watch } from 'vue'

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
        
        // Clear localStorage before making the request
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        localStorage.removeItem('userId');
        
        isAuthenticated.value = false;
        isAdmin.value = false;
        
        // Only make the logout request if you have a token
        if (token) {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Limit headers to only what's needed
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok && response.status !== 431) {
                console.warn('Logout had issues on server side, but proceeded locally');
            }
        }

        // Redirect to the login page
        router.push('/');
    } catch (error) {
        console.error('Error during logout:', error.message);
        // Even if there's an error, clear local state and redirect
        router.push('/');
    }
};



const fetchIsAdmin = async () => {
    try {
        isAdmin.value = localStorage.getItem('admin') === 'on';
        console.log('Admin: ', isAdmin.value);
    } catch (error) {
        console.error('Error during fetchIsAdmin:', error.message);
    }
}

const fetchName = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return; // Exit silently if no token
        }

        const response = await fetch('/api/profile', {
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

<!-- Users nav bar -->
<template>
    <div class="page-container">
        <nav v-if="isAuthenticated && !isAdmin && !isLoading" class="menubar">
            <div class="left">
                <a href="/home">
                    <span>&#127968;</span> Room Booking System
                </a>
            </div>
            <div class="welcome-mobile">
                <span>Welcome, {{ userName.username }}</span>
            </div>
            <div class="hamburger" @click="toggleMenu">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="right" :class="{ 'open': menuOpen }">
                <span class="welcome-desktop">Welcome, {{ userName.username }}</span>
                <a href="/bookings" @click="menuOpen = false">Bookings</a>
                <a href="/myBookings" @click="menuOpen = false">My Bookings</a>
                <a href="/profile" @click="menuOpen = false">Profile</a>
                <a href="/AboutUs" @click="menuOpen = false">About us</a>
                <a href="#" @click="logout(); menuOpen = false">Logout</a>
            </div>
        </nav>
        
        <!-- admin nav bar -->
        <nav v-if="isAuthenticated && isAdmin && !isLoading" class="menubar">
            <div class="left">
                <a href="/home">
                    <span>&#127968;</span>Room Booking System</a>
            </div>
            <div class="welcome-mobile">
                <span>Welcome, {{ userName.username }}</span>
            </div>
            <div class="hamburger" @click="toggleMenu">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="right" :class="{ 'open': menuOpen }">
                <span class="welcome-desktop">Welcome, {{ userName.username }}</span>
                <a href="/rooms" @click="menuOpen = false">Room Information</a>
                <a href="/users" @click="menuOpen = false">User Information</a>
                <a href="/BookingRecords" @click="menuOpen = false">Booking Record</a>
                <a href="/profile" @click="menuOpen = false">Profile</a>
                <a href="/AboutUs" @click="menuOpen = false">About us</a>
                <a href="#" @click="logout(); menuOpen = false">Logout</a>
            </div>
        </nav>

        <div class="main-content">
            <RouterView />
        </div>

        <footer class="app-footer">
            <div class="footer-content">
                <div class="footer-top">
                    <div class="footer-logo">
                        <img src="./images/AboutUs.jpg" alt="KOJU by tronico" class="logo-image" />
                    </div>
                    <div class="footer-links">
                        <router-link to="/about">About us</router-link>
                        <router-link to="/bookings">Bookings</router-link>
                    </div>
                </div>
                
                <div class="footer-info">
                    <div class="company-name">Room Booking System © 2025 - Comp4117 Group C Project</div>
                    
                    <div class="address-section">
                        <h4>HK Headquarter</h4>
                        <p>Unit 219, 2/F, 16 Science Park West Avenue,<br>Shatin, New Territories, Hong Kong</p>
                    </div>
                    
                    <div class="contact-info">
                        <p>TRONICO TECHNOLOGY CO. LTD. (852) 9667 7650</p>
                        <p><a href="mailto:koju@tronico.com.hk">koju@tronico.com.hk</a></p>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.menubar {
    position: sticky;
    top: 0;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #333;
    color: white;
    flex-wrap: wrap;
}

.left a {
    color: white;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.2em;
}

.welcome-mobile {
    display: none;
    font-weight: bold;
    color: white;
}

.hamburger {
    display: none;
    flex-direction: column;
    cursor: pointer;
}

.hamburger span {
    display: block;
    width: 25px;
    height: 3px;
    margin: 3px 0;
    background-color: white;
    border-radius: 2px;
}

.right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.right span.welcome-desktop {
    margin-right: 40px;
    font-weight: bold;
    color: white;
}

.right a {
    color: white;
    text-decoration: none;
    padding: 5px 10px;
    transition: background-color 0.3s;
    border-radius: 4px;
}

.right a:hover {
    background-color: #444;
}

.page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
}

.main-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 0;
}

/* Footer styles */
.app-footer {
    background-color: #f5f5f5;
    border-top: 1px solid #e0e0e0;
    padding: 2rem 1rem;
    width: 100%;
    margin-top: auto;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.footer-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
}

.footer-logo {
    max-width: 150px;
}

.logo-image {
    width: 100%;
    height: auto;
}

.footer-links {
    display: flex;
    gap: 1.5rem;
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

.footer-middle {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
}

.social-links {
    display: flex;
    gap: 1.5rem;
}

.social-links a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #333;
    color: white;
    transition: background-color 0.2s;
}

.social-links a:hover {
    background-color: #4CAF50;
}

.footer-info {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.company-name {
    font-size: 0.9rem;
    color: #666;
}

.address-section h4 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #333;
}

.address-section p {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.5;
    margin: 0;
}

.contact-info {
    font-size: 0.9rem;
    color: #666;
}

.contact-info p {
    margin: 0.3rem 0;
}

.contact-info a {
    color: #4CAF50;
    text-decoration: none;
}

.contact-info a:hover {
    text-decoration: underline;
}

/* Responsive styles for navbar */
@media (max-width: 768px) {
    .menubar {
        padding: 10px 15px;
    }
    
    .welcome-desktop {
        display: none;
    }
    
    .welcome-mobile {
        display: block;
        flex: 1;
        text-align: center;
    }
    
    .hamburger {
        display: flex;
    }
    
    .right {
        display: none;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background-color: #333;
        padding: 0;
        gap: 0;
        box-shadow: 0 5px 10px rgba(0,0,0,0.2);
    }
    
    .right.open {
        display: flex;
    }
    
    .right a {
        width: 100%;
        padding: 10px 20px;
        border-bottom: 1px solid #444;
        text-align: left;
    }
    
    .right a:hover {
        background-color: #444;
    }
}

/* Responsive footer styles */
@media (min-width: 769px) {
    .footer-info {
        flex-direction: row;
        justify-content: space-between;
        text-align: left;
        align-items: flex-start;
    }
    
    .company-name, .address-section, .contact-info {
        flex: 1;
        padding: 0 1rem;
    }
    
    .address-section {
        border-left: 1px solid #e0e0e0;
        border-right: 1px solid #e0e0e0;
    }
}

@media (max-width: 768px) {
    .app-footer {
        padding: 1.5rem 1rem;
    }
    
    .footer-top {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.5rem;
    }
    
    .footer-info {
        gap: 1.5rem;
    }
    
    .address-section, .contact-info {
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
    }
}

@media (max-width: 480px) {
    .app-footer {
        padding: 1rem;
    }
    
    .social-links {
        gap: 1rem;
    }
    
    .social-links a {
        width: 35px;
        height: 35px;
    }
}
</style>