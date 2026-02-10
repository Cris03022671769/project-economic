// src/services/trabajadorService.ts
import prisma from '../lib/prisma';

/**
 * Crea un nuevo trabajador en la base de datos.
 * @param nombre Nombre del trabajador.
 * @param rol Rol del trabajador.
 * @param salario_base Salario base del trabajador.
 * @returns El trabajador creado.
 * @throws Error si el salario base no es positivo.
 */
export async function crearTrabajador(
  nombre: string,
  rol: string,
  salario_base: number
) {
  if (salario_base <= 0) {
    throw new Error('El salario base debe ser un valor positivo.');
  }
  try {
    const nuevoTrabajador = await prisma.trabajador.create({
      data: {
        nombre,
        rol,
        salario_base,
      },
    });
    return nuevoTrabajador;
  } catch (error) {
    console.error('Error al crear trabajador:', error);
    throw new Error('No se pudo crear el trabajador.');
  }
}

/**
 * Obtiene todos los trabajadores de la base de datos.
 * @returns Una lista de todos los trabajadores.
 */
export async function obtenerTrabajadores() {
  try {
    const trabajadores = await prisma.trabajador.findMany();
    return trabajadores;
  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    throw new Error('No se pudieron obtener los trabajadores.');
  }
}

/**
 * Obtiene un trabajador por su ID.
 * @param id ID del trabajador.
 * @returns El trabajador encontrado o null si no existe.
 */
export async function obtenerTrabajadorPorId(id: bigint) {
  try {
    const trabajador = await prisma.trabajador.findUnique({
      where: { id },
    });
    return trabajador;
  } catch (error) {
    console.error('Error al obtener trabajador por ID:', error);
    throw new Error('No se pudo obtener el trabajador.');
  }
}

/**
 * Actualiza un trabajador existente.
 * @param id ID del trabajador a actualizar.
 * @param data Objeto con los campos a actualizar.
 * @returns El trabajador actualizado.
 * @throws Error si el salario base no es positivo.
 */
export async function actualizarTrabajador(
  id: bigint,
  data: {
    nombre?: string;
    rol?: string;
    salario_base?: number;
  }
) {
  if (data.salario_base !== undefined && data.salario_base <= 0) {
    throw new Error('El salario base debe ser un valor positivo.');
  }
  try {
    const trabajadorActualizado = await prisma.trabajador.update({
      where: { id },
      data: {
        ...data,
        salario_base: data.salario_base !== undefined ? data.salario_base : undefined,
      },
    });
    return trabajadorActualizado;
  } catch (error) {
    console.error('Error al actualizar trabajador:', error);
    throw new Error('No se pudo actualizar el trabajador.');
  }
}

/**
 * Elimina un trabajador por su ID.
 * @param id ID del trabajador a eliminar.
 * @returns El trabajador eliminado.
 */
export async function eliminarTrabajador(id: bigint) {
  try {
    const trabajadorEliminado = await prisma.trabajador.delete({
      where: { id },
    });
    return trabajadorEliminado;
  } catch (error) {
    console.error('Error al eliminar trabajador:', error);
    throw new Error('No se pudo eliminar el trabajador.');
  }
}
