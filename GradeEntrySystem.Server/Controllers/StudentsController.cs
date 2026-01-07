using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GradeEntrySystem.Server.Data;
using GradeEntrySystem.Server.Models;
using GradeEntrySystem.Server.Models.DTOs;

namespace GradeEntrySystem.Server.Controllers;

/// <summary>
/// CRUD operations for Students.
/// All endpoints are protected by JWT authentication.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StudentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>List all students (no grades included).</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentDto>>> GetStudents()
    {
        try
        {
            var students = await _context.Students
                .AsNoTracking()
                .Select(s => new StudentDto
                {
                    Id = s.Id,
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    Email = s.Email
                })
                .ToListAsync();
            return Ok(students);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving students", error = ex.Message });
        }
    }

    /// <summary>Get a single student by ID.</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<StudentDto>> GetStudent(int id)
    {
        var student = await _context.Students
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(s => new StudentDto
            {
                Id = s.Id,
                FirstName = s.FirstName,
                LastName = s.LastName,
                Email = s.Email
            })
            .FirstOrDefaultAsync();

        if (student == null)
        {
            return NotFound();
        }

        return student;
    }

    /// <summary>Create a new student.</summary>
    [HttpPost]
    public async Task<ActionResult<StudentDto>> PostStudent(Student student)
    {
        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        var studentDto = new StudentDto
        {
            Id = student.Id,
            FirstName = student.FirstName,
            LastName = student.LastName,
            Email = student.Email
        };

        return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, studentDto);
    }

    /// <summary>Update an existing student.</summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> PutStudent(int id, Student student)
    {
        if (id != student.Id)
        {
            return BadRequest();
        }

        _context.Entry(student).State = Microsoft.EntityFrameworkCore.EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!StudentExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    /// <summary>Delete a student by ID.</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null)
        {
            return NotFound();
        }

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool StudentExists(int id)
    {
        return _context.Students.Any(e => e.Id == id);
    }
}
