export const arPerfiles: Perfiles[] = [
    {perfil: 0, perfilnom: 'Administrador', perfileng: 'Administrator'},
    {perfil: 1, perfilnom: 'Auditor', perfileng: 'Auditor'},
    {perfil: 2, perfilnom: 'Laboratorio', perfileng: 'Laboratory'},
    {perfil: 3, perfilnom: 'Compras', perfileng: 'Purchase'},
    {perfil: 4, perfilnom: 'Proveedor', perfileng: 'Supplier'}
]

interface Perfiles {
  perfil: number
  perfilnom: string
  perfileng: string
}