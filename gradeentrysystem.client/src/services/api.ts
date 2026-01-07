import api from './authService';

/**
 * Shared TypeScript interfaces and light API client wrappers for Students, Courses, and Grades.
 * All requests are routed through the axios instance that injects the JWT automatically.
 */
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  grades?: Grade[];
}

export interface Course {
  id: number;
  code: string;
  name: string;
  grades?: Grade[];
}

export interface Grade {
  id: number;
  studentId: number;
  courseId: number;
  gradeValue: string;
  dateEntered: string;
  enteredByTeacherId: number;
  student?: Student;
  course?: Course;
}

export const studentsApi = {
  // CRUD for Students (server returns DTOs without nested grades)
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: number) => api.get<Student>(`/students/${id}`),
  create: (student: Omit<Student, 'id'>) => api.post<Student>('/students', student),
  update: (id: number, student: Student) => api.put(`/students/${id}`, student),
  delete: (id: number) => api.delete(`/students/${id}`),
};

export const coursesApi = {
  // CRUD for Courses
  getAll: () => api.get<Course[]>('/courses'),
  getById: (id: number) => api.get<Course>(`/courses/${id}`),
  create: (course: Omit<Course, 'id'>) => api.post<Course>('/courses', course),
  update: (id: number, course: Course) => api.put(`/courses/${id}`, course),
  delete: (id: number) => api.delete(`/courses/${id}`),
};

export const gradesApi = {
  // CRUD + filters for Grades (server returns DTO with optional nested student/course)
  getAll: () => api.get<Grade[]>('/grades'),
  getById: (id: number) => api.get<Grade>(`/grades/${id}`),
  getByStudent: (studentId: number) => api.get<Grade[]>(`/grades/student/${studentId}`),
  getByCourse: (courseId: number) => api.get<Grade[]>(`/grades/course/${courseId}`),
  create: (grade: Omit<Grade, 'id' | 'dateEntered' | 'enteredByTeacherId'>) => 
    api.post<Grade>('/grades', grade),
  update: (id: number, grade: Grade) => api.put(`/grades/${id}`, grade),
  delete: (id: number) => api.delete(`/grades/${id}`),
};
