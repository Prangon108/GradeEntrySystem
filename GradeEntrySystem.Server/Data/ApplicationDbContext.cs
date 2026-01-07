using Microsoft.EntityFrameworkCore;
using GradeEntrySystem.Server.Models;

namespace GradeEntrySystem.Server.Data;

/// <summary>
/// Entity Framework Core database context for the Grade Entry System.
/// Defines entity sets and configures relationships between them.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Grade> Grades { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Each Grade references exactly one Student and one Course.
        // Deletion of a Student/Course will be restricted if Grades reference them.
        modelBuilder.Entity<Grade>()
            .HasOne(g => g.Student)
            .WithMany(s => s.Grades)
            .HasForeignKey(g => g.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Grade>()
            .HasOne(g => g.Course)
            .WithMany(c => c.Grades)
            .HasForeignKey(g => g.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
