<script setup>
import { ref, onMounted } from 'vue';
import { loadScript } from "@paypal/paypal-js";
import { useRouter } from 'vue-router';

const router = useRouter();

const bookingDetails = ref({
  roomId: '',
  roomName: '',
  roomNumber: '',
  date: '',
  timeslots: [],
  totalPrice: 0,
  userId: '',
  username: '',
  userContact: '',
  userEmail: '',
});

const paymentMethod = ref('credit_card');
const cardNumber = ref('');
const cardholderName = ref('');
const expiryDate = ref('');
const cvv = ref('');
const isProcessing = ref(false);
const errors = ref({});
const paypalLoaded = ref(false);
let paypal;

onMounted(async () => {
  const details = JSON.parse(localStorage.getItem('pendingBookingDetails'));
  if (details) {
    bookingDetails.value = details;
  } else {
    alert('No booking details found!');
    router.push('/bookings');
  }

  try {
    paypal = await loadScript({ clientId: 'AbB0Y1oixi3sgEZdVbzhe9RSYadn-cwaEkG-jWVFCAWesdvsZORFoSrejNG-AEJPZaVuo7nS9b3d8XmA' });
    paypalLoaded.value = true;
  } catch (error) {
    console.error("failed to load the PayPal JS SDK script", error);
  }

});

// Get booking details from route params
onMounted(() => {
  const details = JSON.parse(localStorage.getItem('pendingBookingDetails'));
  if (details) {
    bookingDetails.value = details;
  } else {
    alert('No booking details found!');
    router.push('/bookings');
  }
});

const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (paymentMethod.value === 'credit_card') {
    if (!cardNumber.value || cardNumber.value.length < 16) {
      errors.value.cardNumber = 'Please enter a valid card number';
      isValid = false;
    }

    if (!cardholderName.value) {
      errors.value.cardholderName = 'Please enter the cardholder name';
      isValid = false;
    }

    if (!expiryDate.value) {
      errors.value.expiryDate = 'Please enter the expiry date';
      isValid = false;
    }

    if (!cvv.value || cvv.value.length < 3) {
      errors.value.cvv = 'Please enter a valid CVV';
      isValid = false;
    }
  }

  return isValid;
};

const renderPayPalButton = async () => {
  await paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: bookingDetails.value.totalPrice.toString()
          }
        }]
      });
    },
    onApprove: async (data, actions) => {
      const order = await actions.order.capture();
      console.log('Order', order);
      await completeBooking();
      localStorage.removeItem('pendingBookingDetails');
      alert('Payment successful! Your room has been booked.');
      router.push('/bookings');
    },
    onError: (err) => {
      console.error('PayPal Checkout onError', err);
      alert('Payment failed. Please try again.');
    }
  }).render('#paypal-button-container');
};

const processPayment = async () => {
  if (paymentMethod.value === 'paypal') {
    renderPayPalButton();
    return;
  }
  if (!validateForm()) {
    return;
  }

  isProcessing.value = true;

  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // After successful payment, proceed with the booking
    await completeBooking();

    // Clear the pending booking details
    localStorage.removeItem('pendingBookingDetails');

    // Show success message and redirect
    alert('Payment successful! Your room has been booked.');
    router.push('/bookings');
  } catch (error) {
    alert(`Payment failed: ${error.message}`);
  } finally {
    isProcessing.value = false;
  }
};

const completeBooking = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingDetails.value)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to book room');
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing booking:', error);
    throw error;
  }
};

const formatTimeslots = (timeslots) => {
  if (!timeslots || timeslots.length === 0) return 'No timeslots selected';

  if (timeslots.length === 24) {
    return 'All Day';
  }

  const startTime = timeslots[0];
  const endTime = timeslots[timeslots.length - 1];
  return `${startTime} - ${endTime}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};
</script>

<template>
  <div class="payment-container">
    <h1>Payment</h1>

    <div class="booking-summary">
      <h2>Booking Summary</h2>
      <div class="summary-details">
        <div class="summary-row">
          <span class="label">Room:</span>
          <span class="value">{{ bookingDetails.roomName }}</span>
        </div>
        <div class="summary-row">
          <span class="label">Room Number:</span>
          <span class="value">{{ bookingDetails.roomNumber }}</span>
        </div>
        <div class="summary-row">
          <span class="label">Date:</span>
          <span class="value">{{ formatDate(bookingDetails.date) }}</span>
        </div>
        <div class="summary-row">
          <span class="label">Time:</span>
          <span class="value">{{ formatTimeslots(bookingDetails.timeslots) }}</span>
        </div>
        <div class="summary-row total">
          <span class="label">Total Price:</span>
          <span class="value price">HKD {{ bookingDetails.totalPrice }}</span>
        </div>
      </div>
    </div>

    <div class="payment-methods">
      <h2>Payment Method</h2>
      <div class="payment-options">
        <div class="payment-option">
          <input type="radio" id="paypalRadio" value="paypal" v-model="paymentMethod">
          <label for="paypal">PayPal</label>
        </div>
      </div>
    </div>



    <div v-if="paymentMethod === 'paypal'" class="paypal-info">
      <div v-if="paypalLoaded">
        <div id="paypal-button-container"></div>
      </div>
      <div v-else>
        <p>Loading PayPal...</p>
      </div>
    </div>


    <div class="payment-actions">
      <button class="btn-back" @click="router.go(-1)">
        Back
      </button>
      <button class="btn-pay" @click="processPayment" :disabled="isProcessing">
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Pay Now</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.payment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

h2 {
  color: #444;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.booking-summary {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-row:last-child {
  border-bottom: none;
}

.total {
  margin-top: 1rem;
  font-weight: bold;
}

.price {
  color: #28a745;
  font-size: 1.2rem;
}

.payment-methods {
  margin-bottom: 2rem;
}

.payment-options {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.credit-card-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

.form-row .form-group {
  flex: 1;
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.payment-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn-back,
.btn-pay {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-back {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-back:hover {
  background-color: #5a6268;
}

.btn-pay {
  background-color: #28a745;
  color: white;
  border: none;
  min-width: 150px;
}

.btn-pay:hover {
  background-color: #218838;
}

.btn-pay:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.paypal-info,
.apple-pay-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}
</style>