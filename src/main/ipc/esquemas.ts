// Esquemas que validan lo que llega desde la ventana (05-arquitectura.md › Seguridad: validar todo contenido externo).
import { z } from 'zod'
import { LARGO_NOMBRE_REPO } from '../../compartido/github'
import { ESTADOS_DESDE_IDEAS } from '../../compartido/ideas'
import {
  ANCHO_LISTA_IDEAS,
  ANCHO_LISTA_SKILLS,
  LARGO_AJUSTES,
  PROYECTOS_CON_FILTRO,
} from '../../compartido/puente'
import { LARGO_MENSAJE } from '../../compartido/sincronia'
import { ESTADOS } from '../../compartido/tipos'
import { HORA_ARRANQUE } from '../core/arranque'
import { LIMITE_NOMBRE_PROYECTO } from '../core/creacion'
import { AjusteIa, AnchosConversacion } from '../infra/config'

export const CambioPreferencias = z
  .object({
    verArchivados: z.boolean(),
    anchoConversacion: AnchosConversacion.strict(),
    anchoListaSkills: z.number().int().min(ANCHO_LISTA_SKILLS.minimo).max(ANCHO_LISTA_SKILLS.maximo),
    anchoListaIdeas: z.number().int().min(ANCHO_LISTA_IDEAS.minimo).max(ANCHO_LISTA_IDEAS.maximo),
    anchoHoja: z.enum(['angosto', 'normal', 'ancho']),
    pestanas: z.array(z.string().min(1).max(1024)).max(50),
    ajustesIa: z.record(z.string().min(1).max(1024), AjusteIa.strict()),
    filtrosBandeja: z
      .record(z.string().min(1).max(1024), z.string().max(200))
      .refine((f) => Object.keys(f).length <= PROYECTOS_CON_FILTRO),
    abierto: z.string().min(1).max(1024).nullable(),
    nombreUsuario: z.string().max(LARGO_AJUSTES.nombreUsuario),
    nombreIa: z.string().max(LARGO_AJUSTES.nombreIa),
    // Que sea uno de los estilos de Claude Code se comprueba en el puente.
    tono: z.string().max(LARGO_AJUSTES.tono),
    arranque: z.object({ prendido: z.boolean(), hora: z.string().regex(HORA_ARRANQUE) }).strict(),
    actualizacionApagada: z.array(z.string().min(1).max(1024)).max(500),
  })
  .partial()
  .strict()

/** La carpeta de un proyecto (después se comprueba que esté en la carpeta de proyectos). */
export const Ruta = z.string().min(1).max(1024)

/** Lo escrito en el cuadro de una conversación (como un mensaje: hasta 100 000 caracteres). */
export const Escrito = z.string().max(100_000)

/** La hoja de Ideas entera (D-126): como mucho lo que lee Docs, 2 MB. */
export const TextoNotas = z.string().max(2 * 1024 * 1024)

/** El tipo de una imagen pegada (`image/png`). */
export const Mime = z.string().max(64)

/** Una imagen pegada, en base64: como mucho 20 MB. */
export const ImagenBase64 = z.string().max(Math.ceil((20 * 1024 * 1024 * 4) / 3) + 4)

/** Las imágenes pegadas en el campo de Ideas antes de anotar (R-87): hasta 10. */
export const ImagenesAlAnotar = z.array(z.object({ mime: Mime, base64: ImagenBase64 }).strict()).max(10)

export const Tengo = z.number().int().min(0)

export const Pedido = z
  .object({
    texto: z.string().max(100_000),
    nueva: z.boolean(),
  })
  .partial()
  .strict()

export const Codigo = z.string().regex(/^Q-[1-9]\d{0,3}$/)

/** Una idea de la sección Ideas: un `T-n` de `trabajo.md` (D-130). */
export const CodigoIdea = z.string().regex(/^T-[1-9]\d{0,3}$/)

/** Aprobar, rechazar, volver a sin evaluar o marcar revisado (ID-3). */
export const EstadoIdeaEsquema = z.enum(ESTADOS_DESDE_IDEAS)

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

/** El mensaje de Commit y subir (D-159). */
export const MensajeCommit = z.string().max(LARGO_MENSAJE)

/** El estado elegido en el menú de la tarjeta (R-7). */
export const EstadoFicha = z.enum(ESTADOS)

/** El nombre de un proyecto nuevo; que sirva para una carpeta lo dice `problemaNombreProyecto`. */
export const NombreProyecto = z.string().max(LIMITE_NOMBRE_PROYECTO * 2)

/** Una maqueta de la sección Diseño: relativa a `docs/diseno/`, sin salir de ahí (se comprueba otra vez al leer). */
export const ArchivoMaqueta = z
  .string()
  .min(1)
  .max(512)
  .refine((r) => !r.split('/').includes('..') && !r.includes(':') && !r.includes('\\') && !r.startsWith('/'))

export const PedidoDisenoEsquema = z.enum(['empezar'])
