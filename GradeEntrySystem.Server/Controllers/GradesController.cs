using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GradeEntrySystem.Server.Data;
using GradeEntrySystem.Server.Models;
using GradeEntrySystem.Server.Models.DTOs;
using GradeEntrySystem.Server.Services;

namespace GradeEntrySystem.Server.Controllers;

/// <summary>
/// CRUD operations for Grades .
/// All endpoints are protected by JWT authentication.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GradesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public GradesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>List all grades with basic student/course info.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GradeDto>>> GetGrades()
    {
        try
        {
            var gradeDtos = await _context.Grades
                .AsNoTracking()
                .Select(g => new GradeDto
                {
                    Id = g.Id,
                    StudentId = g.StudentId,
                    CourseId = g.CourseId,
                    GradeValue = g.GradeValue,
                    DateEntered = g.DateEntered,
                    EnteredByTeacherId = g.EnteredByTeacherId,
                    Student = g.Student != null ? new StudentDto
                    {
                        Id = g.Student.Id,
                        FirstName = g.Student.FirstName,
                        LastName = g.Student.LastName,
                        Email = g.Student.Email
                    } : null,
                    Course = g.Course != null ? new CourseDto
                    {
                        Id = g.Course.Id,
                        Code = g.Course.Code,
                        Name = g.Course.Name
                    } : null
                })
                .ToListAsync();

            return Ok(gradeDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving grades", error = ex.Message });
        }
    }

    /// <summary>Get a single grade by ID.</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<GradeDto>> GetGrade(int id)
    {
        var gradeDto = await _context.Grades
            .AsNoTracking()
            .Where(g => g.Id == id)
            .Select(g => new GradeDto
            {
                Id = g.Id,
                StudentId = g.StudentId,
                CourseId = g.CourseId,
                GradeValue = g.GradeValue,
                DateEntered = g.DateEntered,
                EnteredByTeacherId = g.EnteredByTeacherId,
                Student = g.Student != null ? new StudentDto
                {
                    Id = g.Student.Id,
                    FirstName = g.Student.FirstName,
                    LastName = g.Student.LastName,
                    Email = g.Student.Email
                } : null,
                Course = g.Course != null ? new CourseDto
                {
                    Id = g.Course.Id,
                    Code = g.Course.Code,
                    Name = g.Course.Name
                } : null
            })
            .FirstOrDefaultAsync();

        if (gradeDto == null)
        {
            return NotFound();
        }

        return gradeDto;
    }

    /// <summary>List all grades for a specific student.</summary>
    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<IEnumerable<GradeDto>>> GetGradesByStudent(int studentId)
    {
        var gradeDtos = await _context.Grades
            .AsNoTracking()
            .Where(g => g.StudentId == studentId)
            .Select(g => new GradeDto
            {
                Id = g.Id,
                StudentId = g.StudentId,
                CourseId = g.CourseId,
                GradeValue = g.GradeValue,
                DateEntered = g.DateEntered,
                EnteredByTeacherId = g.EnteredByTeacherId,
                Student = g.Student != null ? new StudentDto
                {
                    Id = g.Student.Id,
                    FirstName = g.Student.FirstName,
                    LastName = g.Student.LastName,
                    Email = g.Student.Email
                } : null,
                Course = g.Course != null ? new CourseDto
                {
                    Id = g.Course.Id,
                    Code = g.Course.Code,
                    Name = g.Course.Name
                } : null
            })
            .ToListAsync();

        return Ok(gradeDtos);
    }

    /// <summary>List all grades for a specific course.</summary>
    [HttpGet("course/{courseId}")]
    public async Task<ActionResult<IEnumerable<GradeDto>>> GetGradesByCourse(int courseId)
    {
        var gradeDtos = await _context.Grades
            .AsNoTracking()
            .Where(g => g.CourseId == courseId)
            .Select(g => new GradeDto
            {
                Id = g.Id,
                StudentId = g.StudentId,
                CourseId = g.CourseId,
                GradeValue = g.GradeValue,
                DateEntered = g.DateEntered,
                EnteredByTeacherId = g.EnteredByTeacherId,
                Student = g.Student != null ? new StudentDto
                {
                    Id = g.Student.Id,
                    FirstName = g.Student.FirstName,
                    LastName = g.Student.LastName,
                    Email = g.Student.Email
                } : null,
                Course = g.Course != null ? new CourseDto
                {
                    Id = g.Course.Id,
                    Code = g.Course.Code,
                    Name = g.Course.Name
                } : null
            })
            .ToListAsync();

        return Ok(gradeDtos);
    }

    /// <summary>Create a new grade (validated against a predefined grade scale).</summary>
    [HttpPost]
    public async Task<ActionResult<GradeDto>> PostGrade([FromBody] CreateGradeDto? createGradeDto)
    {
        try
        {
            if (createGradeDto == null)
            {
                return BadRequest(new { message = "Request body is required" });
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .SelectMany(x => x.Value!.Errors)
                    .Select(x => x.ErrorMessage)
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors, receivedData = new { createGradeDto.StudentId, createGradeDto.CourseId, createGradeDto.GradeValue } });
            }

            if (!GradeScale.IsValid(createGradeDto.GradeValue))
            {
                return BadRequest(new
                {
                    message = "Invalid gradeValue. Please choose a valid grade option.",
                    allowedValues = GradeScale.AllowedValues
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            // Verify student and course exist
            var studentExists = await _context.Students.AnyAsync(s => s.Id == createGradeDto.StudentId);
            var courseExists = await _context.Courses.AnyAsync(c => c.Id == createGradeDto.CourseId);

            if (!studentExists)
            {
                return BadRequest(new { message = $"Student with ID {createGradeDto.StudentId} not found" });
            }

            if (!courseExists)
            {
                return BadRequest(new { message = $"Course with ID {createGradeDto.CourseId} not found" });
            }

            var grade = new Grade
            {
                StudentId = createGradeDto.StudentId,
                CourseId = createGradeDto.CourseId,
                GradeValue = createGradeDto.GradeValue,
                EnteredByTeacherId = userId,
                DateEntered = DateTime.UtcNow
            };

            _context.Grades.Add(grade);
            await _context.SaveChangesAsync();

            // Reload using projection to avoid circular references
            var gradeDto = await _context.Grades
                .AsNoTracking()
                .Where(g => g.Id == grade.Id)
                .Select(g => new GradeDto
                {
                    Id = g.Id,
                    StudentId = g.StudentId,
                    CourseId = g.CourseId,
                    GradeValue = g.GradeValue,
                    DateEntered = g.DateEntered,
                    EnteredByTeacherId = g.EnteredByTeacherId,
                    Student = g.Student != null ? new StudentDto
                    {
                        Id = g.Student.Id,
                        FirstName = g.Student.FirstName,
                        LastName = g.Student.LastName,
                        Email = g.Student.Email
                    } : null,
                    Course = g.Course != null ? new CourseDto
                    {
                        Id = g.Course.Id,
                        Code = g.Course.Code,
                        Name = g.Course.Name
                    } : null
                })
                .FirstOrDefaultAsync();

            if (gradeDto == null)
            {
                return StatusCode(500, new { message = "Failed to retrieve created grade" });
            }

            return CreatedAtAction(nameof(GetGrade), new { id = grade.Id }, gradeDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating grade", error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    /// <summary>Update an existing grade's fields.</summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> PutGrade(int id, Grade grade)
    {
        if (id != grade.Id)
        {
            return BadRequest();
        }

        if (!GradeScale.IsValid(grade.GradeValue))
        {
            return BadRequest(new
            {
                message = "Invalid gradeValue. Please choose a valid grade option.",
                allowedValues = GradeScale.AllowedValues
            });
        }

        var existingGrade = await _context.Grades.FindAsync(id);
        if (existingGrade == null)
        {
            return NotFound();
        }

        existingGrade.StudentId = grade.StudentId;
        existingGrade.CourseId = grade.CourseId;
        existingGrade.GradeValue = grade.GradeValue;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!GradeExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    /// <summary>Delete a grade by ID.</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGrade(int id)
    {
        var grade = await _context.Grades.FindAsync(id);
        if (grade == null)
        {
            return NotFound();
        }

        _context.Grades.Remove(grade);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool GradeExists(int id)
    {
        return _context.Grades.Any(e => e.Id == id);
    }
}
