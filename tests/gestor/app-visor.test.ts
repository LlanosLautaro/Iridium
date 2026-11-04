// Copiado de la app anterior de proyectos (D-026).
// Casos de uso del visor sobre carpetas temporales: cargar, mostrar, guardar respuestas, pegar y quitar imágenes,
// contar las preguntas sin responder (diseno-tecnico.md del módulo › Pruebas).
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  contarSinResponder,
  DocumentosProyecto,
  rutaDeArchivoValida,
  rutaDeDocumentoValida,
} from '../../src/main/app/visor'

const ESTADO = `# Estado

## Preguntas abiertas
- **Q-1 — ¿Miniatura 3D o plana?**
  Contexto: D-1. Opciones: A) 3D (recomendada) · B) plana.
- **Q-2 — ¿Nombre del botón?**
  Contexto: sin opciones.
`

let carpeta: string
const escribir = async (ruta: string, texto: string) => {
  const abs = join(carpeta, ...ruta.split('/'))
  await mkdir(join(abs, '..'), { recursive: true })
  await writeFile(abs, texto)
}
const leer = (ruta: string) => readFile(join(carpeta, ...ruta.split('/')), 'utf8')
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]).toString('base64')

async function proyecto(): Promise<DocumentosProyecto> {
  const p = new DocumentosProyecto(carpeta, (r) => `uri:${r}`)
  await p.cargar()
  return p
}

beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'gestor-visor-'))
  await escribir('docs/estado.md', ESTADO)
  await escribir('docs/decisiones.md', '# Decisiones\n\n## D-1 — Primera\nTexto.\n')
  await escribir('README.md', '# Léame\n')
  await escribir('node_modules/paquete/README.md', '# No se lee\n')
})
afterEach(async () => {
  await rm(carpeta, { recursive: true, force: true })
})

describe('cargar y mostrar', () => {
  it('lista docs/ y la raíz (sin node_modules), arranca en docs/estado.md y arma las preguntas', async () => {
    const v = (await proyecto()).vista()
    if (v.tipo !== 'documentos') throw new Error(v.tipo)
    expect(v.inicial).toBe('docs/estado.md')
    expect(v.raiz.map((n) => n.nombre)).toEqual(['README.md'])
    expect(v.preguntas.map((q) => [q.codigo, q.estado, q.opciones.length])).toEqual([
      ['Q-1', 'sin-responder', 2],
      ['Q-2', 'sin-responder', 0],
    ])
    expect(v.preguntas[0]?.contextoHtml).toContain('data-codigo="D-1"')
    expect(v.sinResponder).toBe(2)
  })

  it('sin ningún .md: sinDocumentos; sin docs/: aviso', async () => {
    const vacia = await mkdtemp(join(tmpdir(), 'gestor-visor-vacia-'))
    try {
      const p = new DocumentosProyecto(vacia, () => null)
      await p.cargar()
      expect(p.vista().tipo).toBe('sinDocumentos')
      await writeFile(join(vacia, 'README.md'), '# Hola')
      await p.cargar()
      const v = p.vista()
      expect(v.tipo === 'documentos' && !v.tieneDocs && v.inicial === 'README.md').toBe(true)
    } finally {
      await rm(vacia, { recursive: true, force: true })
    }
  })

  it('al recargar solo cambian los archivos nuevos, modificados o borrados', async () => {
    const p = await proyecto()
    expect(await p.cargar()).toEqual([])
    await escribir('docs/nuevo.md', '# Nuevo')
    await rm(join(carpeta, 'README.md'))
    expect((await p.cargar()).sort()).toEqual(['README.md', 'docs/nuevo.md'])
    expect(p.documento('README.md')).toEqual({ tipo: 'noExiste' })
  })

  it('el documento de estado trae los lugares de las tarjetas; la vista previa de un código', async () => {
    const p = await proyecto()
    const d = p.documento('docs/estado.md')
    expect(d.tipo === 'ok' && d.html.includes('data-pregunta="Q-1"')).toBe(true)
    expect(p.vistaPrevia('docs/decisiones.md', 'd-1')).toMatchObject({
      titulo: 'D-1 — Primera',
      documento: 'decisiones.md',
    })
    expect(p.dondeNace('D-1', 'docs/estado.md')).toEqual({ ruta: 'docs/decisiones.md', ancla: 'd-1' })
    expect(p.dondeNace('D-9', 'docs/estado.md')).toBeNull()
  })

  it('las rutas que pide la pestaña no salen de la carpeta', () => {
    expect(rutaDeDocumentoValida('docs/estado.md')).toBe(true)
    expect(rutaDeDocumentoValida('../otro/estado.md')).toBe(false)
    expect(rutaDeDocumentoValida('C:/x.md')).toBe(false)
    expect(rutaDeDocumentoValida('docs/imagen.png')).toBe(false)
    expect(rutaDeArchivoValida('src/index.ts')).toBe(true)
    expect(rutaDeArchivoValida('src/../../x')).toBe(false)
  })
})

describe('guardar una respuesta (D-030, D-033)', () => {
  const guardar = (
    p: DocumentosProyecto,
    cambios: Partial<Parameters<DocumentosProyecto['guardarRespuesta']>[0]>,
  ) =>
    p.guardarRespuesta({
      codigo: 'Q-2',
      opcion: null,
      texto: '',
      imagenes: [],
      huella: '',
      forzar: false,
      ...cambios,
    })

  it('crea docs/respuestas/Q-n.md y la pregunta pasa a Respondida', async () => {
    const p = await proyecto()
    const r = await guardar(p, { texto: 'Documentación' })
    expect(r.tipo).toBe('guardado')
    expect(await leer('docs/respuestas/Q-2.md')).toBe('# Q-2 — ¿Nombre del botón?\n\nDocumentación\n')
    const v = p.vista()
    expect(v.tipo === 'documentos' && v.preguntas[1]?.estado).toBe('respondida')
    expect(v.tipo === 'documentos' && v.sinResponder).toBe(1)
  })

  it('una respuesta vacía no crea el archivo', async () => {
    const p = await proyecto()
    expect((await guardar(p, { texto: '   ' })).tipo).toBe('guardado')
    expect(existsSync(join(carpeta, 'docs', 'respuestas', 'Q-2.md'))).toBe(false)
  })

  it('elegir una opción la guarda con su texto', async () => {
    const p = await proyecto()
    await p.guardarRespuesta({
      codigo: 'Q-1',
      opcion: 'A',
      texto: '',
      imagenes: [],
      huella: '',
      forzar: false,
    })
    expect(await leer('docs/respuestas/Q-1.md')).toBe('# Q-1 — ¿Miniatura 3D o plana?\n\n**Opción:** A) 3D\n')
  })

  it('si cambió fuera del visor, no se pisa (salvo Reemplazar con la mía)', async () => {
    const p = await proyecto()
    const primera = await guardar(p, { texto: 'Uno' })
    if (primera.tipo !== 'guardado') throw new Error(primera.tipo)
    await escribir('docs/respuestas/Q-2.md', '# Q-2 — ¿Nombre del botón?\n\nLo cambió la IA\n')
    const r = await guardar(p, { texto: 'Dos', huella: primera.respuesta.huella })
    expect(r.tipo).toBe('cambio')
    expect(r.tipo === 'cambio' && r.respuesta.texto).toBe('Lo cambió la IA')
    expect(await leer('docs/respuestas/Q-2.md')).toContain('Lo cambió la IA')
    const forzada = await guardar(p, { texto: 'Dos', huella: primera.respuesta.huella, forzar: true })
    expect(forzada.tipo).toBe('guardado')
    expect(await leer('docs/respuestas/Q-2.md')).toContain('Dos')
  })

  it('una respuesta procesada no se escribe', async () => {
    await escribir(
      'docs/respuestas/Q-2.md',
      '# Q-2 — ¿Nombre del botón?\n\nSí\n\n> Procesada el 2026-10-10 → D-1\n',
    )
    const p = await proyecto()
    const v = p.vista()
    expect(v.tipo === 'documentos' && v.preguntas[1]?.estado).toBe('procesada')
    const huella = v.tipo === 'documentos' ? (v.preguntas[1]?.respuesta.huella ?? '') : ''
    expect((await guardar(p, { texto: 'otra', huella })).tipo).toBe('procesada')
    expect(await leer('docs/respuestas/Q-2.md')).toContain('Procesada')
  })

  it('si la IA cambia la pregunta con el mismo código, la respuesta anterior no cuenta y la nueva la reemplaza', async () => {
    await escribir('docs/respuestas/Q-1.md', '# Q-1 — ¿Miniatura 3D o plana?\n\n**Opción:** B) plana\n')
    const p = await proyecto()
    const antes = p.vista()
    if (antes.tipo !== 'documentos') throw new Error(antes.tipo)
    expect(antes.preguntas[0]?.estado).toBe('respondida')
    await escribir('docs/estado.md', ESTADO.replace('¿Miniatura 3D o plana?', '¿Fondo claro u oscuro?'))
    await p.cargar()
    const v = p.vista()
    if (v.tipo !== 'documentos') throw new Error(v.tipo)
    const q = v.preguntas[0]
    expect(q?.estado).toBe('sin-responder')
    expect(q?.respuesta.opcion).toBeNull()
    // La huella cambia aunque el archivo no: así la pestaña descarta lo que mostraba.
    expect(q?.respuesta.huella).not.toBe(antes.preguntas[0]?.respuesta.huella)
    expect(await contarSinResponder(carpeta)).toBe(2)
    const r = await guardar(p, { codigo: 'Q-1', opcion: 'A', huella: q?.respuesta.huella ?? '' })
    expect(r.tipo).toBe('guardado')
    expect(await leer('docs/respuestas/Q-1.md')).toBe('# Q-1 — ¿Fondo claro u oscuro?\n\n**Opción:** A) 3D\n')
  })

  it('una procesada de la pregunta anterior no bloquea la nueva', async () => {
    await escribir('docs/respuestas/Q-2.md', '# Q-2 — ¿Otra cosa?\n\nSí\n\n> Procesada el 2026-10-10 → D-1\n')
    const p = await proyecto()
    const v = p.vista()
    if (v.tipo !== 'documentos') throw new Error(v.tipo)
    expect(v.preguntas[1]?.estado).toBe('sin-responder')
    expect((await p.pegarImagen('Q-2', 'image/png', PNG)).ok).toBe(true)
    const r = await guardar(p, { texto: 'Nueva', huella: v.preguntas[1]?.respuesta.huella ?? '' })
    expect(r.tipo).toBe('guardado')
    expect(await leer('docs/respuestas/Q-2.md')).toBe('# Q-2 — ¿Nombre del botón?\n\nNueva\n')
  })

  it('un archivo escrito a mano sin la pregunta en el título cuenta como respuesta', async () => {
    await escribir('docs/respuestas/Q-2.md', 'Documentación\n')
    const v = (await proyecto()).vista()
    expect(v.tipo === 'documentos' && v.preguntas[1]?.estado).toBe('respondida')
  })

  it('rechaza códigos e imágenes que no son de la pregunta', async () => {
    const p = await proyecto()
    expect((await guardar(p, { codigo: '../Q-2' })).tipo).toBe('error')
    expect((await guardar(p, { imagenes: ['Q-1/captura-1.png'] })).tipo).toBe('error')
    expect((await guardar(p, { imagenes: ['Q-2/../../x.png'] })).tipo).toBe('error')
  })
})

describe('pegar y quitar imágenes', () => {
  it('numera sin pisar: captura-1, captura-2… aunque ya exista otro archivo', async () => {
    const p = await proyecto()
    const a = await p.pegarImagen('Q-2', 'image/png', PNG)
    await escribir('docs/respuestas/Q-2/captura-2.jpg', 'ya estaba')
    const b = await p.pegarImagen('Q-2', 'image/jpeg', PNG)
    expect(a.ok && a.imagen.ruta).toBe('Q-2/captura-1.png')
    expect(b.ok && b.imagen.ruta).toBe('Q-2/captura-3.jpg')
    expect(b.ok && b.imagen.uri).toBe('uri:docs/respuestas/Q-2/captura-3.jpg')
    expect(await leer('docs/respuestas/Q-2/captura-2.jpg')).toBe('ya estaba')
  })

  it('rechaza lo que no es imagen y lo que pesa más de 20 MB', async () => {
    const p = await proyecto()
    const pdf = await p.pegarImagen('Q-2', 'application/pdf', PNG)
    expect(pdf).toEqual({ ok: false, mensaje: 'Por ahora solo se pueden pegar imágenes.' })
    const grande = Buffer.alloc(20 * 1024 * 1024 + 1).toString('base64')
    expect((await p.pegarImagen('Q-2', 'image/png', grande)).ok).toBe(false)
    expect(existsSync(join(carpeta, 'docs', 'respuestas', 'Q-2'))).toBe(false)
  })

  it('quitar manda la imagen a la papelera (no la borra)', async () => {
    const p = await proyecto()
    await p.pegarImagen('Q-2', 'image/png', PNG)
    const papelera: string[] = []
    await p.quitarImagen('Q-2', 'Q-2/captura-1.png', async (ruta) => {
      papelera.push(ruta)
    })
    expect(papelera).toEqual([join(carpeta, 'docs', 'respuestas', 'Q-2', 'captura-1.png')])
    await expect(p.quitarImagen('Q-2', 'Q-2/../../../x', async () => {})).rejects.toThrow()
    expect(await readdir(join(carpeta, 'docs', 'respuestas', 'Q-2'))).toEqual(['captura-1.png'])
  })
})

describe('número del botón (D-029)', () => {
  it('cuenta las preguntas sin responder del estado general y de los módulos', async () => {
    await escribir('docs/modulos/visor/estado.md', '## Preguntas abiertas\n- **Q-3 — ¿Otra?**\n')
    expect(await contarSinResponder(carpeta)).toBe(3)
    await escribir('docs/respuestas/Q-1.md', '# Q-1 — ¿Miniatura 3D o plana?\n\n**Opción:** B) plana\n')
    expect(await contarSinResponder(carpeta)).toBe(2)
  })

  it('sin docs/ cuenta 0', async () => {
    const vacia = await mkdtemp(join(tmpdir(), 'gestor-visor-vacia-'))
    try {
      expect(await contarSinResponder(vacia)).toBe(0)
    } finally {
      await rm(vacia, { recursive: true, force: true })
    }
  })
})

describe('rendimiento', () => {
  const grande = 'D:/Carpeta Personal/Proyectos/Gamma'
  it.skipIf(!existsSync(join(grande, 'docs', '07-construccion.md')) || !!process.env.IRIDIUM_COBERTURA)(
    'el documento de 80 KB de Gamma se convierte en menos de 100 ms',
    async () => {
      const p = new DocumentosProyecto(grande, (r) => r)
      await p.cargar()
      p.documento('docs/estado.md')
      // La mejor de tres: con todas las pruebas en paralelo, una sola mide la competencia por el procesador (Defecto 12).
      let ms = Number.POSITIVE_INFINITY
      for (let i = 0; i < 3; i++) {
        const t0 = performance.now()
        const d = p.documento('docs/07-construccion.md')
        ms = Math.min(ms, performance.now() - t0)
        expect(d.tipo).toBe('ok')
      }
      expect(ms).toBeLessThan(100)
    },
  )
})
