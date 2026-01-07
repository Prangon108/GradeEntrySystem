using GradeEntrySystem.Server.Models;
using GradeEntrySystem.Server.Services;

namespace GradeEntrySystem.Server.Data;

public static class DbSeeder
{
    public static void Seed(ApplicationDbContext context)
    {
        // Seed teacher user 
        var teacherUser = context.Users.FirstOrDefault(u => u.Username == "teacher");
        if (teacherUser == null)
        {
            teacherUser = new User
            {
                Username = "teacher",
                Email = "teacher@gradeentry.com",
                PasswordHash = PasswordHasher.HashPassword("teacher123"),
                Role = "Teacher"
            };
            context.Users.Add(teacherUser);
        }

        

        // Create sample students
        if (!context.Students.Any())
        {
            var students = new List<Student>
            {
                new Student { FirstName = "Test", LastName = "User1", Email = "test.user1@student.com" },
                new Student { FirstName = "Test", LastName = "User2", Email = "test.user2@student.com" },
                new Student { FirstName = "Test", LastName = "User3", Email = "test.user3@student.com" },
                new Student { FirstName = "Test", LastName = "User4", Email = "test.user4@student.com" }
            };

            context.Students.AddRange(students);
        }

        // Create sample courses
        if (!context.Courses.Any())
        {
            var courses = new List<Course>
            {
                new Course { Code = "MATH101", Name = "Calculus I" },
                new Course { Code = "CS101", Name = "Introduction to Computer Science" },
                new Course { Code = "ENG101", Name = "English Composition" },
                new Course { Code = "PHYS101", Name = "Physics I" }
            };

            context.Courses.AddRange(courses);
        }

        context.SaveChanges();

        // Create sample grades
        if (!context.Grades.Any())
        {
            var students = context.Students.OrderBy(s => s.Id).Take(2).ToList();
            var courses = context.Courses.OrderBy(c => c.Id).Take(3).ToList();

            if (students.Count >= 2 && courses.Count >= 3)
            {
                var grades = new List<Grade>
                {
                    new Grade
                    {
                        StudentId = students[0].Id,
                        CourseId = courses[0].Id,
                        GradeValue = "A (93-100)",
                        DateEntered = DateTime.UtcNow,
                        EnteredByTeacherId = teacherUser.Id
                    },
                    new Grade
                    {
                        StudentId = students[0].Id,
                        CourseId = courses[1].Id,
                        GradeValue = "B+ (87-89)",
                        DateEntered = DateTime.UtcNow,
                        EnteredByTeacherId = teacherUser.Id
                    },
                    new Grade
                    {
                        StudentId = students[1].Id,
                        CourseId = courses[0].Id,
                        GradeValue = "A- (90-92)",
                        DateEntered = DateTime.UtcNow,
                        EnteredByTeacherId = teacherUser.Id
                    },
                    new Grade
                    {
                        StudentId = students[1].Id,
                        CourseId = courses[2].Id,
                        GradeValue = "A (93-100)",
                        DateEntered = DateTime.UtcNow,
                        EnteredByTeacherId = teacherUser.Id
                    }
                };

                context.Grades.AddRange(grades);
                context.SaveChanges();
            }
        }
    }
}
