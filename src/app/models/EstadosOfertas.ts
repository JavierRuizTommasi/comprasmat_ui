export const arEstadosOfertas: EstadosOfertas[] = [
    {estado: 0, estadoesp: 'Ingresada', estadoeng: 'Entered'},
    {estado: 1, estadoesp: 'Evaluación', estadoeng: 'Evaluation'},
    {estado: 2, estadoesp: 'Pendiente', estadoeng: 'Pending'},
    {estado: 3, estadoesp: 'Aceptada', estadoeng: 'Acepted'},
    {estado: 4, estadoesp: 'Rechazada', estadoeng: 'Rejected'},
]

interface EstadosOfertas {
  estado: number
  estadoesp: string
  estadoeng: string
}