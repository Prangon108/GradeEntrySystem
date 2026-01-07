namespace GradeEntrySystem.Server.Models;

/// <summary>
/// A grade awarded to a student for a course, entered by a teacher.
/// </summary>
public class Grade
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public string GradeValue { get; set; } = string.Empty; // e.g., "A (93-100)"
    public DateTime DateEntered { get; set; }
    public int EnteredByTeacherId { get; set; }
    
    // Navigation properties
    public Student Student { get; set; } = null!;
    public Course Course { get; set; } = null!;
}
