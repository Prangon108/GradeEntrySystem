using System.Text.Json.Serialization;

namespace GradeEntrySystem.Server.Models;

/// <summary>
/// Course offered (e.g., CS101).
/// </summary>
public class Course
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty; // e.g., "MATH101"
    public string Name { get; set; } = string.Empty; // e.g., "Calculus I"
    
    [JsonIgnore]
    public List<Grade> Grades { get; set; } = new();
}
