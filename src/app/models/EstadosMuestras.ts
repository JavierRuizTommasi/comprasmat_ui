export const arEstadosMuestras: EstadosMuestras[] = [
    {estado: 0, estadoesp: 'Recivida', estadoeng: 'Received'},
    {estado: 1, estadoesp: 'Laboratorio', estadoeng: 'Laboratory'},
    {estado: 2, estadoesp: 'Aceptada', estadoeng: 'Acepted'},
    {estado: 3, estadoesp: 'Rechazada', estadoeng: 'Rejected'},
]

interface EstadosMuestras {
  estado: number
  estadoesp: string
  estadoeng: string
}