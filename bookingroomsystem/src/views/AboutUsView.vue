<template>
  <div class="about-us">
    <h1>About Us</h1>
    <div class="content">
      <div class="text-content">
        <p>
          Welcome to our booking room system. We are dedicated to providing the
          best service for booking rooms efficiently and effectively.
        </p>
        <section class="company-info">
          <h2>Our Company</h2>
          <p>
            Founded in 2025, our company has been at the forefront of providing
            top-notch room booking services. Our mission is to make booking
            rooms as seamless and convenient as possible.
          </p>
          <h3>Our Values</h3>
          <ul>
            <li>Customer Satisfaction</li>
            <li>Innovation</li>
            <li>Integrity</li>
            <li>Teamwork</li>
          </ul>
          <h3>Our Vision</h3>
          <p>
            We envision a world where booking rooms is effortless, allowing
            individuals and businesses to focus on what truly matters. Our
            platform is designed to adapt to the evolving needs of our users.
          </p>
          <h3>Our Commitment</h3>
          <p>
            We are committed to continuous improvement, ensuring that our
            services remain reliable, user-friendly, and accessible to everyone.
            Your satisfaction is our priority.
          </p>
        </section>
      </div>
      <div class="image-container">
        <img
          class="company-image"
          src="@/images/AboutUs.jpeg"
          alt="Company Image"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-us {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.about-us h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #333;
}

.content {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 30px;
  margin-top: 20px;
  text-align: left;
}

.text-content {
  flex: 1;
  min-width: 300px;
}

.text-content p {
  font-size: 1.2em;
  line-height: 1.6;
  color: #555;
}

.company-info {
  margin-top: 30px;
}

.company-info h2 {
  font-size: 2em;
  margin-bottom: 15px;
  color: #444;
}

.company-info h3 {
  font-size: 1.6em;
  margin-top: 20px;
  color: #555;
}

.company-info ul {
  list-style-type: disc;
  padding-left: 20px;
}

.company-info li {
  font-size: 1.2em;
  margin-bottom: 10px;
  color: #666;
}

.image-container {
  flex: 1;
  min-width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.company-image {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>