<script setup>

</script>

<template>
  <main>
    <MenuBar /> 
    <TheWelcome />
    <section>
      <h1>Welcome to the Booking Room System</h1>
      <p>This is the home page of our booking room system. Here you can find information about our services and how to book a room.</p>>
    </section>
  </main>
</template>

<script>
export default {
  methods: {
    bookRoom() {
      // Add your booking logic here
      alert('Booking room...');
    }
  }
}
</script>

<style scoped>
main {
  padding: 20px;
  text-align: center;
}

h1 {
  font-size: 2em;
  margin-bottom: 0.5em;
}

p {
  font-size: 1.2em;
  margin-bottom: 1em;
}

button {
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
}
</style>
