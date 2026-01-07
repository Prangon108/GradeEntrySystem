# Grade Entry System

full-stack web application for teachers to manage student grades, built with ASP.NET Core Web API (C#) backend and React.js (TypeScript) frontend.

## Features

### Authentication
- **User Registration**: Teachers can create new accounts with username, email, and password
- **User Login**: Secure JWT token-based authentication
- **Protected Routes**: Dashboard and API endpoints require authentication
- **Session Management**: Automatic token storage and validation

### Student Management
- **View Students**: Display all students in a clean table format
- **Add Student**: Create new student records with first name, last name, and email
- **Edit Student**: Update existing student information
- **Delete Student**: Remove student records with confirmation dialog

### Course Management
- **View Courses**: Display all courses with code and name
- **Add Course**: Create new courses (e.g., MATH101 - Calculus I)
- **Edit Course**: Update course information
- **Delete Course**: Remove courses with confirmation dialog

### Grade Management
- **View Grades**: Display all grades in a comprehensive table showing:
  - Student name
  - Course code and name
  - Grade value with percentage range (e.g., "A (93-100)")
  - Date entered
- **Add Grade**: Enter grades for students in specific courses
- **Edit Grade**: Update existing grade entries
- **Delete Grade**: Remove grade entries with confirmation dialog
- **Grade Scale**: Predefined grade options with percentage ranges:
  - A (93-100), A- (90-92)
  - B+ (87-89), B (83-86), B- (80-82)
  - C+ (77-79), C (73-76), C- (70-72)
  - D+ (67-69), D (63-66), D- (60-62)
  - F (0-59)

### User Interface
- **Modern Design**: Clean, simple UI built with Tailwind CSS
- **Responsive Layout**: Works on different screen sizes
- **Toast Notifications**: Success and error messages for all operations
- **Confirmation Dialogs**: Custom popup dialogs for delete operations
- **Tab Navigation**: Easy switching between Grades, Students, and Courses
- **Loading States**: Visual feedback during data operations

## Prerequisites

Before running this application, ensure you have the following installed:

### Required Software

1. **.NET SDK 10.0** or later
   - Download from: https://dotnet.microsoft.com/download
   - Verify installation: `dotnet --version` 

2. **Node.js 18.x** or later and npm
   - Download from: https://nodejs.org/
   - Verify installation: 
     - `node --version` 
     - `npm --version` 

3. **Visual Studio 2022 or higher** (optional, but recommended)
   - Includes .NET SDK and development tools



## Installation

### 1. Clone or Download the Project

If you have the project files, navigate to the project directory:

```bash
cd "C:\GradeEntrySystem"
```

### 2. Install Frontend Dependencies

Navigate to the client folder and install npm packages:

```bash
cd gradeentrysystem.client
npm install
```

This will install all required packages including:
- React and React DOM
- React Router DOM
- Axios
- Tailwind CSS
- TypeScript and related tools

### 3. Install Backend Dependencies

The .NET SDK will automatically restore NuGet packages when you build the project. No manual installation needed.

## How to Run the Application

### Option 1: Using Visual Studio (Recommended)

1. **Open the Solution**
   - Open `GradeEntrySystem.slnx` in Visual Studio 2022
   - Or open the `GradeEntrySystem.Server` folder as a project

2. **Set Startup Project**
   - Right-click on `GradeEntrySystem.Server` in Solution Explorer
   - Select "Set as Startup Project"

3. **Run the Application**
   - Press `F5` or click the "Run" button
   - Visual Studio will automatically:
     - Start the backend API server
     - Launch the frontend development server
     - Open your browser to `http://localhost:5173`

### Option 2: Using Command Line

#### Step 1: Start the Backend Server

Open a terminal/command prompt and navigate to the server directory:

```bash
cd "C:\GradeEntrySystem\GradeEntrySystem.Server"
dotnet run
```

The backend will start on:
- **HTTPS**: `https://localhost:7162`
- **HTTP**: `http://localhost:5054`

#### Step 2: Start the Frontend Server

Open a **new** terminal/command prompt and navigate to the client directory:

```bash
cd "C:\GradeEntrySystem\gradeentrysystem.client"
npm run dev
```

The frontend will start on:
- **HTTP**: `http://localhost:5173`

#### Step 3: Access the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

## Default Credentials

The application comes with a seeded teacher account:

- **Username**: `teacher`
- **Password**: `teacher123`

You can also register a new account using the "Register" option on the login page.



## Technology Stack

### Backend
- **.NET 10.0** - Framework
- **ASP.NET Core Web API** - REST API framework
- **Entity Framework Core** - ORM for database operations
- **SQLite** - File-based database (development)
- **JWT Bearer Authentication** - Token-based security

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS 4** - Utility-first CSS framework
- **Vite** - Build tool and dev server

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students (Protected)
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Courses (Protected)
- `GET /api/courses` - Get all courses
- `GET /api/courses/{id}` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Grades (Protected)
- `GET /api/grades` - Get all grades
- `GET /api/grades/{id}` - Get grade by ID
- `GET /api/grades/student/{studentId}` - Get grades for a student
- `GET /api/grades/course/{courseId}` - Get grades for a course
- `POST /api/grades` - Create new grade
- `PUT /api/grades/{id}` - Update grade
- `DELETE /api/grades/{id}` - Delete grade

## Configuration

### Backend Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=GradeEntrySystem.db"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!",
    "Issuer": "GradeEntrySystem",
    "Audience": "GradeEntrySystem",
    "ExpirationInMinutes": 60
  }
}
```

### Frontend Configuration (`vite.config.ts`)

The frontend is configured to proxy API requests to the backend:
- Backend URL: `https://localhost:7162`
- Frontend URL: `http://localhost:5173`

## Development Notes

- The database is automatically created and seeded on first startup
- Sample data includes:
  - 1 teacher user (username: `teacher`, password: `teacher123`)
  - 4 sample students (Test User1, Test User2, etc.)
  - 4 sample courses (MATH101, CS101, ENG101, PHYS101)
  - Sample grade entries

