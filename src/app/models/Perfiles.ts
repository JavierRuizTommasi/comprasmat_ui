export const arPerfiles: Perfiles[] = [
    {perfil: 0, perfilnom: 'Administrador', perfileng: 'Administrator'},
    {perfil: 1, perfilnom: 'Auditor', perfileng: 'Auditor'},
    {perfil: 2, perfilnom: 'Compras', perfileng: 'Purchase'},
    {perfil: 3, perfilnom: 'Laboratorio', perfileng: 'Laboratory'},
    {perfil: 4, perfilnom: 'Proveedor', perfileng: 'Supplier'},
    {perfil: 5, perfilnom: 'Pendiente', perfileng: 'Pending'}
]

interface Perfiles {
  perfil: number
  perfilnom: string
  perfileng: string
}