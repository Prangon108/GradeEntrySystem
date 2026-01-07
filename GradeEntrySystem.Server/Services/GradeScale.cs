namespace GradeEntrySystem.Server.Services;

public static class GradeScale
{
    // Labels are designed to be clear in the UI and fit the current CreateGradeDto StringLength(10).
    public static readonly IReadOnlyList<string> AllowedValues = new List<string>
    {
        "A (93-100)",
        "A- (90-92)",
        "B+ (87-89)",
        "B (83-86)",
        "B- (80-82)",
        "C+ (77-79)",
        "C (73-76)",
        "C- (70-72)",
        "D+ (67-69)",
        "D (63-66)",
        "D- (60-62)",
        "F (0-59)"
    };

    private static readonly HashSet<string> AllowedSet = new(AllowedValues, StringComparer.Ordinal);

    public static bool IsValid(string? gradeValue)
    {
        if (string.IsNullOrWhiteSpace(gradeValue))
        {
            return false;
        }

        return AllowedSet.Contains(gradeValue.Trim());
    }
}

