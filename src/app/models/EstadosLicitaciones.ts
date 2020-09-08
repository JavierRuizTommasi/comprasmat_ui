export const arEstadosLicitaciones: EstadosLicitaciones[] = [
    {estado: 0, estadoesp: 'Ingresada', estadoeng: 'Entered'},
    {estado: 1, estadoesp: 'Activa', estadoeng: 'Active'},
    {estado: 2, estadoesp: 'Pendiente', estadoeng: 'Pending'},
    {estado: 3, estadoesp: 'Adjudicada', estadoeng: 'Selected'},
    {estado: 4, estadoesp: 'Cerrada', estadoeng: 'Closed'}
]

interface EstadosLicitaciones {
  estado: number
  estadoesp: string
  estadoeng: string
}