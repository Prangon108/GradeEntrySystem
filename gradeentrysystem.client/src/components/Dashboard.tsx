import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { studentsApi, coursesApi, gradesApi } from '../services/api';
import type { Student, Course, Grade } from '../services/api';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

/**
 * Main teacher dashboard with tabs for Grades, Students, and Courses.
 */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'students' | 'courses' | 'grades'>('grades');
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        studentsApi.getAll(),
        coursesApi.getAll(),
      ]);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'students') {
        const response = await studentsApi.getAll();
        setStudents(response.data);
      } else if (activeTab === 'courses') {
        const response = await coursesApi.getAll();
        setCourses(response.data);
      } else {
        const response = await gradesApi.getAll();
        setGrades(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [activeTab, loadData]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">
            Grade Entry System
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-slate-600 font-medium">Welcome, {localStorage.getItem('username')}</span>
            <button 
              onClick={handleLogout}
              className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white px-8">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto">
          <button
            className={`px-6 py-4 text-sm font-medium transition ${
              activeTab === 'grades'
                ? 'border-b-2 border-slate-700 text-slate-800 font-semibold'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('grades')}
          >
            Grades
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium transition ${
              activeTab === 'students'
                ? 'border-b-2 border-slate-700 text-slate-800 font-semibold'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium transition ${
              activeTab === 'courses'
                ? 'border-b-2 border-slate-700 text-slate-800 font-semibold'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-8 py-8">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-lg">Loading...</div>
        ) : (
          <>
            {activeTab === 'grades' && <GradesTab grades={grades} onRefresh={loadData} students={students} courses={courses} showToast={setToast} />}
            {activeTab === 'students' && <StudentsTab students={students} onRefresh={loadData} showToast={setToast} />}
            {activeTab === 'courses' && <CoursesTab courses={courses} onRefresh={loadData} showToast={setToast} />}
          </>
        )}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function GradesTab({ grades, onRefresh, students, courses, showToast }: { grades: Grade[]; onRefresh: () => void; students: Student[]; courses: Course[]; showToast: (toast: { message: string; type: 'success' | 'error' | 'info' }) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', courseId: '', gradeValue: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; type: 'grade' } | null>(null);

  const gradeOptions = [
    'A (93-100)',
    'A- (90-92)',
    'B+ (87-89)',
    'B (83-86)',
    'B- (80-82)',
    'C+ (77-79)',
    'C (73-76)',
    'C- (70-72)',
    'D+ (67-69)',
    'D (63-66)',
    'D- (60-62)',
    'F (0-59)',
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const grade = grades.find(g => g.id === editingId);
        if (grade) {
          await gradesApi.update(editingId, {
            ...grade,
            studentId: parseInt(formData.studentId),
            courseId: parseInt(formData.courseId),
            gradeValue: formData.gradeValue,
          });
        }
      } else {
        await gradesApi.create({
          studentId: parseInt(formData.studentId),
          courseId: parseInt(formData.courseId),
          gradeValue: formData.gradeValue,
        });
      }
      setShowForm(false);
      setFormData({ studentId: '', courseId: '', gradeValue: '' });
      setEditingId(null);
      onRefresh();
      showToast({ message: editingId ? 'Grade updated successfully' : 'Grade added successfully', type: 'success' });
    } catch (error) {
      console.error('Error saving grade:', error);
      showToast({ message: 'Error saving grade. Please try again.', type: 'error' });
    }
  };

  const handleEdit = (grade: Grade) => {
    setFormData({
      studentId: grade.studentId.toString(),
      courseId: grade.courseId.toString(),
      gradeValue: grade.gradeValue,
    });
    setEditingId(grade.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDelete({ id, type: 'grade' });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await gradesApi.delete(confirmDelete.id);
      onRefresh();
      showToast({ message: 'Grade deleted successfully', type: 'success' });
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting grade:', error);
      showToast({ message: 'Error deleting grade. Please try again.', type: 'error' });
      setConfirmDelete(null);
    }
  };


  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">Grades</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ studentId: '', courseId: '', gradeValue: '' }); }}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Add Grade
        </button>
      </div>

      {showForm && (
        <form className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-lg" onSubmit={handleSubmit}>
          <h3 className="mb-5 text-lg font-semibold text-slate-800">{editingId ? 'Edit Grade' : 'Add New Grade'}</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Student</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Grade</label>
              <select
                value={formData.gradeValue}
                onChange={(e) => setFormData({ ...formData, gradeValue: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select Grade</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="submit" className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Student</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Course</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Grade</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Date Entered</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {grades.map(grade => (
              <tr key={grade.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-700">{grade.student ? `${grade.student.firstName} ${grade.student.lastName}` : 'N/A'}</td>
                <td className="px-6 py-4 text-slate-700">{grade.course ? `${grade.course.code} - ${grade.course.name}` : 'N/A'}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{grade.gradeValue}</td>
                <td className="px-6 py-4 text-slate-700">{new Date(grade.dateEntered).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(grade)} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1">Edit</button>
                    <button onClick={() => handleDelete(grade.id)} className="rounded-lg bg-slate-400 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Grade"
          message="Are you sure you want to delete this grade? This action cannot be undone."
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}

function StudentsTab({ students, onRefresh, showToast }: { students: Student[]; onRefresh: () => void; showToast: (toast: { message: string; type: 'success' | 'error' | 'info' }) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const student = students.find(s => s.id === editingId);
        if (student) {
          await studentsApi.update(editingId, { ...student, ...formData });
        }
      } else {
        await studentsApi.create(formData);
      }
      setShowForm(false);
      setFormData({ firstName: '', lastName: '', email: '' });
      setEditingId(null);
      onRefresh();
      showToast({ message: editingId ? 'Student updated successfully' : 'Student added successfully', type: 'success' });
    } catch (error) {
      console.error('Error saving student:', error);
      showToast({ message: 'Error saving student. Please try again.', type: 'error' });
    }
  };

  const handleEdit = (student: Student) => {
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await studentsApi.delete(confirmDelete);
      onRefresh();
      showToast({ message: 'Student deleted successfully', type: 'success' });
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      showToast({ message: 'Error deleting student. Please try again.', type: 'error' });
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">Students</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ firstName: '', lastName: '', email: '' }); }}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Add Student
        </button>
      </div>

      {showForm && (
        <form className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-lg" onSubmit={handleSubmit}>
          <h3 className="mb-5 text-lg font-semibold text-slate-800">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">First Name</label>
              <input
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Last Name</label>
              <input
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="submit" className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">First Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Last Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map(student => (
              <tr key={student.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-700">{student.firstName}</td>
                <td className="px-6 py-4 text-slate-700">{student.lastName}</td>
                <td className="px-6 py-4 text-slate-700">{student.email}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(student)} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1">Edit</button>
                    <button onClick={() => handleDelete(student.id)} className="rounded-lg bg-slate-400 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Student"
          message="Are you sure you want to delete this student? This action cannot be undone."
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}

function CoursesTab({ courses, onRefresh, showToast }: { courses: Course[]; onRefresh: () => void; showToast: (toast: { message: string; type: 'success' | 'error' | 'info' }) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const course = courses.find(c => c.id === editingId);
        if (course) {
          await coursesApi.update(editingId, { ...course, ...formData });
        }
      } else {
        await coursesApi.create(formData);
      }
      setShowForm(false);
      setFormData({ code: '', name: '' });
      setEditingId(null);
      onRefresh();
      showToast({ message: editingId ? 'Course updated successfully' : 'Course added successfully', type: 'success' });
    } catch (error) {
      console.error('Error saving course:', error);
      showToast({ message: 'Error saving course. Please try again.', type: 'error' });
    }
  };

  const handleEdit = (course: Course) => {
    setFormData({
      code: course.code,
      name: course.name,
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await coursesApi.delete(confirmDelete);
      onRefresh();
      showToast({ message: 'Course deleted successfully', type: 'success' });
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast({ message: 'Error deleting course. Please try again.', type: 'error' });
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">Courses</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ code: '', name: '' }); }}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Add Course
        </button>
      </div>

      {showForm && (
        <form className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-lg" onSubmit={handleSubmit}>
          <h3 className="mb-5 text-lg font-semibold text-slate-800">{editingId ? 'Edit Course' : 'Add New Course'}</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Course Code</label>
              <input
                type="text"
                placeholder="e.g., MATH101"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Course Name</label>
              <input
                type="text"
                placeholder="e.g., Calculus I"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="submit" className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Code</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {courses.map(course => (
              <tr key={course.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-700 font-medium">{course.code}</td>
                <td className="px-6 py-4 text-slate-700">{course.name}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(course)} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1">Edit</button>
                    <button onClick={() => handleDelete(course.id)} className="rounded-lg bg-slate-400 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
