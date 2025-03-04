# TechMinds

TechMinds is a production-grade web application with a Spring Boot backend and React frontend.

## Features

- **Secure Authentication**: JWT-based authentication system
- **User Management**: Complete user registration, login, and profile management
- **Email Verification**: Email verification system for new user accounts
- **Role-Based Access Control**: Granular permissions system
- **Responsive UI**: Modern Material UI design that works on all devices

## Technology Stack

### Backend

- **Java 17**
- **Spring Boot 3.x**
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **PostgreSQL** for data storage
- **Flyway** for database migrations
- **Thymeleaf** for email templates
- **Swagger/OpenAPI** for API documentation

### Frontend

- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Material UI** for component library
- **Axios** for API communication

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL 13 or higher

### Backend Setup

1. Configure your database connection in `src/main/resources/application.yml`
2. Run the Spring Boot application:

```bash
./mvnw spring-boot:run
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

## API Documentation

API documentation is available at `/swagger-ui.html` when the application is running.

## Security Features

- JWT-based authentication
- Password encryption with BCrypt
- Role-based access control
- Email verification
- Account verification
- Session management

## License

This project is licensed under the MIT License - see the LICENSE file for details.
