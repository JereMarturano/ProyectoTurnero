using Microsoft.EntityFrameworkCore;
using Turnero.Core;

namespace Turnero.Infrastructure;

public class TurneroDbContext : DbContext
{
    public TurneroDbContext(DbContextOptions<TurneroDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Turn> Turns { get; set; }
}
