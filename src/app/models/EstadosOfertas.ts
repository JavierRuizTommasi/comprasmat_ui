export const arEstadosOfertas: EstadosOfertas[] = [
    {estado: 0, estadoesp: 'Evaluación', estadoeng: 'Evaluation'},
    {estado: 1, estadoesp: 'Aceptada', estadoeng: 'Acepted'},
    {estado: 2, estadoesp: 'Rechazada', estadoeng: 'Rejected'},
]

interface EstadosOfertas {
  estado: number
  estadoesp: string
  estadoeng: string
}