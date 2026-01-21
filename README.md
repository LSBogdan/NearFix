# 🚗 **NearFix: Your All-in-One Auto Service Ecosystem** 🛠️

Welcome to **NearFix**—a comprehensive digital platform designed to bridge the gap between vehicle owners and auto repair services. Our application transforms traditional, inefficient communication into a modern, transparent experience for everyone involved in the automotive industry. Whether you are a driver seeking a reliable mechanic or a garage owner looking to digitize your business operations, NearFix is your complete solution! 🚀

---

## Key Features 🗝️

### Tailored User Roles & Secure Authentication 🔒
- **Role-Based Access:** Dedicated interfaces for Clients, Service Staff, Garage Owners, and Administrators ensure that everyone has the right tools for their specific needs.
- **Verified Accounts:** Automated email validation at registration ensures a secure account and reliable notification delivery.
- **Advanced Security:** Powered by Spring Security and JWT, the system features a robust refresh token mechanism to maintain a continuous and protected user session.

### Vehicle Management & Digital Repair History 🚘
- **Personal Fleet:** Users can register multiple vehicles by providing VIN numbers and technical specifications such as engine capacity and fuel type.
- **Transparent Maintenance:** Every vehicle maintains a complete history of repairs performed within the NearFix network, allowing users to track what work was done and by whom.
- **Visual Profiles:** Personalize your account and vehicle profiles with custom images stored securely in the cloud using AWS S3.

### Smart Garage Discovery & Recommendations 🗺️
- **Intelligent Recommendations:** A multi-criteria engine suggests the best garages based on user location, service ratings, and technical compatibility with the required repair.
- **Interactive Mapping:** Easily find and navigate to local service centers using our integrated Mapbox interface with real-time location data.
- **Verified Quality:** To ensure trust, new garages must undergo a rigorous document verification process by an administrator before appearing on the platform.

### Automated Booking & Staff Assignment 📅
- **Seamless Scheduling:** Clients can book appointments directly through the app, choosing the most convenient time slots based on garage availability.
- **Smart Resource Allocation:** An advanced algorithm automatically assigns tasks to the most suitable technician based on their specialization and current workload.
- **Real-Time Notifications:** Automated email alerts keep everyone informed when repairs are completed or when new service requests are made.

### Collaborative Social Feed & Community 📢💬
- **Interactive Discussions:** Join the community by creating posts, asking for technical advice, or sharing your automotive experiences.
- **Real-Time Engagement:** Experience instant updates for likes and comments thanks to WebSocket integration.
- **Content Sorting:** Stay up to date with the latest or most popular discussions using flexible filtering and sorting options.

---

## Cutting-Edge Technologies & Tools 🛠️

- **🐳 Docker:** Ensures consistent deployment through environment containerization and isolation.
- **🐘 PostgreSQL:** A high-performance relational database managed through PGAdmin for complex data entity modeling.
- **☕ Java & Spring Boot:** Powers the scalable backend with Hibernate for efficient data persistence and object-relational mapping.
- **⚛️ ReactJS & Vite:** Delivers a dynamic, responsive frontend that functions seamlessly across all device types.
- **🎨 Tailwind CSS:** Provides modern, responsive styling and fluid visual transitions.
- **⚡ Redis:** Implemented for high-speed caching to optimize response times and handle real-time social interactions.
- **🗺️ Mapbox:** Enhances geographical services with interactive, high-quality maps.
- **☁️ AWS (Amazon Web Services):**
    - **S3:** Scalable cloud storage for profile pictures, vehicle images, and legal documents.
    - **RDS:** Managed database hosting for high availability and automated backups.
    - **Elastic Beanstalk:** Automated deployment platform for the Spring Boot backend.
    - **CloudFront:** Global Content Delivery Network (CDN) for fast delivery of the React frontend.

---

Join the **NearFix** community today and experience a new standard of automotive repair management that is organized, transparent, and built for the future! 🏎️✨
