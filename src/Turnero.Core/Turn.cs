
namespace Turnero.Core;

public class Turn
{
    public int Id { get; set; }
    public int Number { get; set; }
    public DateTime Timestamp { get; set; }
    public TurnStatus Status { get; set; }
}

public enum TurnStatus
{
    Waiting,
    Called,
    Finished
}
