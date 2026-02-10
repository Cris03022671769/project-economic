// src/services/clienteService.ts
import prisma from '../lib/prisma';
import { ClienteTipo } from '@prisma/client';

/**
 * Crea un nuevo cliente en la base de datos.
 * @param nombre Nombre del cliente.
 * @param tipo Tipo de cliente (HOTEL, SALUD, CASA).
 * @param direccion Dirección del cliente.
 * @param tarifa_por_m3 Tarifa por metro cúbico para el cliente.
 * @returns El cliente creado.
 * @throws Error si la tarifa por m3 no es positiva.
 */
export async function crearCliente(
  nombre: string,
  tipo: ClienteTipo,
  direccion: string,
  tarifa_por_m3: number
) {
  if (tarifa_por_m3 <= 0) {
    throw new Error('La tarifa por m3 debe ser un valor positivo.');
  }
  try {
    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre,
        tipo,
        direccion,
        tarifa_por_m3,
      },
    });
    return nuevoCliente;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw new Error('No se pudo crear el cliente.');
  }
}

/**
 * Obtiene todos los clientes de la base de datos.
 * @returns Una lista de todos los clientes.
 */
export async function obtenerClientes() {
  try {
    const clientes = await prisma.cliente.findMany();
    return clientes;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw new Error('No se pudieron obtener los clientes.');
  }
}

/**
 * Obtiene un cliente por su ID.
 * @param id ID del cliente.
 * @returns El cliente encontrado o null si no existe.
 */
export async function obtenerClientePorId(id: bigint) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });
    return cliente;
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    throw new Error('No se pudo obtener el cliente.');
  }
}

/**
 * Actualiza un cliente existente.
 * @param id ID del cliente a actualizar.
 * @param data Objeto con los campos a actualizar.
 * @returns El cliente actualizado.
 * @throws Error si la tarifa por m3 no es positiva.
 */
export async function actualizarCliente(
  id: bigint,
  data: {
    nombre?: string;
    tipo?: ClienteTipo;
    direccion?: string;
    tarifa_por_m3?: number;
  }
) {
  if (data.tarifa_por_m3 !== undefined && data.tarifa_por_m3 <= 0) {
    throw new Error('La tarifa por m3 debe ser un valor positivo.');
  }
  try {
    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: {
        ...data,
        tarifa_por_m3: data.tarifa_por_m3 !== undefined ? data.tarifa_por_m3 : undefined,
      },
    });
    return clienteActualizado;
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    throw new Error('No se pudo actualizar el cliente.');
  }
}

/**
 * Elimina un cliente por su ID.
 * @param id ID del cliente a eliminar.
 * @returns El cliente eliminado.
 */
export async function eliminarCliente(id: bigint) {
  try {
    const clienteEliminado = await prisma.cliente.delete({
      where: { id },
    });
    return clienteEliminado;
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    throw new Error('No se pudo eliminar el cliente.');
  }
}
