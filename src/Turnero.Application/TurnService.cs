using Turnero.Core;
using Turnero.Infrastructure;

namespace Turnero.Application;

public class TurnService
{
    private readonly TurneroDbContext _context;

    public TurnService(TurneroDbContext context)
    {
        _context = context;
    }

    public Turn GetNextTurn()
    {
        var lastTurnNumber = _context.Turns.Max(t => (int?)t.Number) ?? 0;
        var nextTurn = new Turn
        {
            Number = lastTurnNumber + 1,
            Timestamp = DateTime.UtcNow,
            Status = TurnStatus.Waiting
        };
        _context.Turns.Add(nextTurn);
        _context.SaveChanges();
        return nextTurn;
    }

    public Turn CallTurn()
    {
        var turn = _context.Turns.FirstOrDefault(t => t.Status == TurnStatus.Waiting);
        if (turn != null)
        {
            turn.Status = TurnStatus.Called;
            _context.SaveChanges();
        }
        return turn;
    }

    public Turn FinishTurn()
    {
        var turn = _context.Turns.FirstOrDefault(t => t.Status == TurnStatus.Called);
        if (turn != null)
        {
            turn.Status = TurnStatus.Finished;
            _context.SaveChanges();
        }
        return turn;
    }

    public Turn GetCurrentTurn()
    {
        return _context.Turns.FirstOrDefault(t => t.Status == TurnStatus.Called);
    }
}
