using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GradeEntrySystem.Server.Data;
using GradeEntrySystem.Server.Models;
using GradeEntrySystem.Server.Models.DTOs;

namespace GradeEntrySystem.Server.Controllers;

/// <summary>
/// CRUD operations for Courses.
/// All endpoints are protected by JWT authentication.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CoursesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>List all courses.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
    {
        try
        {
            var courses = await _context.Courses
                .AsNoTracking()
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    Name = c.Name
                })
                .ToListAsync();
            return Ok(courses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving courses", error = ex.Message });
        }
    }

    /// <summary>Get a single course by ID.</summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CourseDto>> GetCourse(int id)
    {
        var course = await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CourseDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name
            })
            .FirstOrDefaultAsync();

        if (course == null)
        {
            return NotFound();
        }

        return course;
    }

    /// <summary>Create a new course.</summary>
    [HttpPost]
    public async Task<ActionResult<CourseDto>> PostCourse(Course course)
    {
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        var courseDto = new CourseDto
        {
            Id = course.Id,
            Code = course.Code,
            Name = course.Name
        };

        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, courseDto);
    }

    /// <summary>Update an existing course.</summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCourse(int id, Course course)
    {
        if (id != course.Id)
        {
            return BadRequest();
        }

        _context.Entry(course).State = Microsoft.EntityFrameworkCore.EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CourseExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    /// <summary>Delete a course by ID.</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
        {
            return NotFound();
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CourseExists(int id)
    {
        return _context.Courses.Any(e => e.Id == id);
    }
}
