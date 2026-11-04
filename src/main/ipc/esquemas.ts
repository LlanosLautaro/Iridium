// Esquemas que validan lo que llega desde la ventana (05-arquitectura.md › Seguridad: validar todo contenido externo).
import { z } from 'zod'
import { LARGO_NOMBRE_REPO } from '../../compartido/github'
import {
  ANCHO_CONVERSACION,
  ANCHO_LISTA_IDEAS,
  ANCHO_LISTA_SKILLS,
  LARGO_AJUSTES,
  TEMAS,
} from '../../compartido/puente'
import { AjusteIa } from '../infra/config'

export const CambioPreferencias = z
  .object({
    verArchivados: z.boolean(),
    anchoConversacion: z.number().int().min(ANCHO_CONVERSACION.minimo).max(ANCHO_CONVERSACION.maximo),
    anchoListaSkills: z.number().int().min(ANCHO_LISTA_SKILLS.minimo).max(ANCHO_LISTA_SKILLS.maximo),
    anchoListaIdeas: z.number().int().min(ANCHO_LISTA_IDEAS.minimo).max(ANCHO_LISTA_IDEAS.maximo),
    anchoHoja: z.enum(['angosto', 'normal', 'ancho']),
    pestanas: z.array(z.string().min(1).max(1024)).max(50),
    ajustesIa: z.record(z.string().min(1).max(1024), AjusteIa.strict()),
    abierto: z.string().min(1).max(1024).nullable(),
    tema: z.enum(TEMAS),
    nombreUsuario: z.string().max(LARGO_AJUSTES.nombreUsuario),
    nombreIa: z.string().max(LARGO_AJUSTES.nombreIa),
    // Que sea uno de los estilos de Claude Code se comprueba en el puente.
    tono: z.string().max(LARGO_AJUSTES.tono),
  })
  .partial()
  .strict()

/** La carpeta de un proyecto (después se comprueba que esté en la carpeta de proyectos). */
export const Ruta = z.string().min(1).max(1024)

/** Lo escrito en el cuadro de una conversación (como un mensaje: hasta 100 000 caracteres). */
export const Escrito = z.string().max(100_000)

export const Tengo = z.number().int().min(0)

export const Pedido = z
  .object({
    texto: z.string().max(100_000),
    nueva: z.boolean(),
  })
  .partial()
  .strict()

export const Codigo = z.string().regex(/^Q-[1-9]\d{0,3}$/)

/** Un documento del proyecto (después se comprueba que sea un `.md` sin salir de la carpeta). */
export const Documento = z.string().min(1).max(512)

/** Un archivo o una carpeta del proyecto (`''` = la raíz); después se comprueba que no salga de la carpeta. */
export const RutaArchivo = z.string().max(1024)

/** El id de un script: el ancla de su título en `docs/scripts.md`. */
export const IdScript = z.string().min(1).max(200)

/** El id de una conversación guardada (un UUID de Claude Code; el motor falso usa `falsa-n`). */
export const IdConversacion = z.string().regex(/^[\w-]{1,128}$/)

export const EsquemaBorrador = z
  .object({
    opcion: z
      .string()
      .regex(/^([A-Z]|Otro)$/)
      .nullable(),
    otro: z.string().max(10_000),
    nota: z.string().max(100_000),
    marcas: z.array(z.boolean()).max(200),
    notas: z.array(z.string().max(10_000)).max(200),
  })
  .strict()

export const PedidoResponder = z
  .object({
    codigo: Codigo,
    borrador: EsquemaBorrador,
    huella: z.string().max(64),
    forzar: z.boolean(),
    postergar: z.boolean().optional(),
  })
  .strict()

/** Un comentario de la Revisión (`R-n`). */
export const CodigoComentario = z.string().regex(/^R-[1-9]\d{0,5}$/)

/** La nota al reabrir un comentario. */
export const NotaReabrir = z.string().max(5000)

/** Un commit (solo letras hexadecimales) o `sin-guardar`: nunca empieza con `-`. */
export const CommitPedido = z.string().regex(/^([0-9a-f]{4,64}|sin-guardar)$/)

export const HashCommit = z.string().regex(/^[0-9a-f]{4,64}$/)

/** Publicar en GitHub (D-081): que el nombre sea uno que GitHub acepta se comprueba al publicar. */
export const PedidoPublicar = z
  .object({ nombre: z.string().min(1).max(LARGO_NOMBRE_REPO), privado: z.boolean() })
  .strict()
