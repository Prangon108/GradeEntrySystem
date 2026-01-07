using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GradeEntrySystem.Server.Models.DTOs;

public class CreateGradeDto
{
    [Required]
    [JsonPropertyName("studentId")]
    public int StudentId { get; set; }
    
    [Required]
    [JsonPropertyName("courseId")]
    public int CourseId { get; set; }
    
    [Required]
    [StringLength(10)]
    [JsonPropertyName("gradeValue")]
    public string GradeValue { get; set; } = string.Empty;
}
