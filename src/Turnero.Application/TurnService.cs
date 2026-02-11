using Turnero.Core;
using Turnero.Infrastructure;

namespace Turnero.Application;

/// <summary>
/// Servicio para gestionar el ciclo de vida de los turnos/tickets (Solicitar -> Llamar -> Terminar).
/// </summary>
public class TurnService
{
    private readonly TurneroDbContext _context;

    // Constructor: Inyección del contexto de base de datos
    public TurnService(TurneroDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Genera un nuevo ticket para un paciente que acaba de llegar.
    /// Calcula el siguiente número disponible automáticamente.
    /// </summary>
    public Turn GetNextTurn()
    {
        // Busca el número más alto actual en la base de datos.
        // El operador '?? 0' sirve para manejar el caso de que la tabla esté vacía (devuelve 0).
        var lastTurnNumber = _context.Turns.Max(t => (int?)t.Number) ?? 0;

        // Crea el objeto del nuevo turno
        var nextTurn = new Turn
        {
            Number = lastTurnNumber + 1, // Incrementa el número
            Timestamp = DateTime.UtcNow, // Guarda la fecha/hora actual
            Status = TurnStatus.Waiting  // Estado inicial: "Esperando"
        };

        _context.Turns.Add(nextTurn);
        _context.SaveChanges();

        return nextTurn;
    }

    /// <summary>
    /// "Llama" al siguiente turno en la cola (FIFO - First In, First Out).
    /// Cambia el estado de 'Waiting' a 'Called'.
    /// </summary>
    public Turn CallTurn()
    {
        // Busca el primer turno que esté en estado de espera.
        // FirstOrDefault es ideal para colas: atiende al que lleva más tiempo esperando (por orden de ID/inserción).
        var turn = _context.Turns.FirstOrDefault(t => t.Status == TurnStatus.Waiting);

        if (turn != null)
        {
            // Actualiza el estado para indicar que está siendo atendido
            turn.Status = TurnStatus.Called;
            _context.SaveChanges();
        }

        return turn; // Devuelve el turno llamado (o null si no había nadie esperando)
    }

    /// <summary>
    /// Finaliza el turno actual que estaba siendo atendido.
    /// Cambia el estado de 'Called' a 'Finished'.
    /// </summary>
    public Turn FinishTurn()
    {
        // Busca el turno que está actualmente "en pantalla" o siendo llamado.
        var turn = _context.Turns.FirstOrDefault(t => t.Status == TurnStatus.Called);

        if (turn != null)
        {
            // Cierra el ciclo del turno
            turn.Status = TurnStatus.Finished;
            _context.SaveChanges();
        }

        return turn;
    }

    /// <summary>
    /// Obtiene el turno actual (el que está siendo atendido en este momento).
    /// Útil para mostrar en pantallas de "Turno Actual".
    /// </summary>
    public Turn GetCurrentTurn()
    {
        // Simplemente consulta quién está en estado 'Called' sin modificar nada.
        return _context.Turns.FirstOrDefault(t => t.Status == TurnStatus.Called);
    }
}