namespace GradeEntrySystem.Server.Models.DTOs;

public class GradeDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public string GradeValue { get; set; } = string.Empty;
    public DateTime DateEntered { get; set; }
    public int EnteredByTeacherId { get; set; }
    public StudentDto? Student { get; set; }
    public CourseDto? Course { get; set; }
}
