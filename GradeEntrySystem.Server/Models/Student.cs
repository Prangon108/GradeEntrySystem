using System.Text.Json.Serialization;

namespace GradeEntrySystem.Server.Models;

/// <summary>
/// Student receiving grades across courses.
/// </summary>
public class Student
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    [JsonIgnore]
    public List<Grade> Grades { get; set; } = new();
}
