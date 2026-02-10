// src/services/vehiculoService.ts
import prisma from '../lib/prisma';

/**
 * Crea un nuevo vehículo en la base de datos.
 * @param matricula Matrícula única del vehículo.
 * @param capacidad_max_m3 Capacidad máxima en metros cúbicos del vehículo.
 * @param consumo_combustible_litros Consumo de combustible en litros por unidad de distancia.
 * @returns El vehículo creado.
 * @throws Error si la capacidad máxima o el consumo de combustible no son positivos.
 */
export async function crearVehiculo(
  matricula: string,
  capacidad_max_m3: number,
  consumo_combustible_litros: number
) {
  if (capacidad_max_m3 <= 0) {
    throw new Error('La capacidad máxima del vehículo debe ser un valor positivo.');
  }
  if (consumo_combustible_litros <= 0) {
    throw new Error('El consumo de combustible debe ser un valor positivo.');
  }
  try {
    const nuevoVehiculo = await prisma.vehiculo.create({
      data: {
        matricula,
        capacidad_max_m3,
        consumo_combustible_litros,
      },
    });
    return nuevoVehiculo;
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('matricula')) {
      throw new Error('Ya existe un vehículo con esta matrícula.');
    }
    console.error('Error al crear vehículo:', error);
    throw new Error('No se pudo crear el vehículo.');
  }
}

/**
 * Obtiene todos los vehículos de la base de datos.
 * @returns Una lista de todos los vehículos.
 */
export async function obtenerVehiculos() {
  try {
    const vehiculos = await prisma.vehiculo.findMany();
    return vehiculos;
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    throw new Error('No se pudieron obtener los vehículos.');
  }
}

/**
 * Obtiene un vehículo por su ID.
 * @param id ID del vehículo.
 * @returns El vehículo encontrado o null si no existe.
 */
export async function obtenerVehiculoPorId(id: bigint) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id },
    });
    return vehiculo;
  } catch (error) {
    console.error('Error al obtener vehículo por ID:', error);
    throw new Error('No se pudo obtener el vehículo.');
  }
}

/**
 * Actualiza un vehículo existente.
 * @param id ID del vehículo a actualizar.
 * @param data Objeto con los campos a actualizar.
 * @returns El vehículo actualizado.
 * @throws Error si la capacidad máxima o el consumo de combustible no son positivos, o si la matrícula ya existe.
 */
export async function actualizarVehiculo(
  id: bigint,
  data: {
    matricula?: string;
    capacidad_max_m3?: number;
    consumo_combustible_litros?: number;
  }
) {
  if (data.capacidad_max_m3 !== undefined && data.capacidad_max_m3 <= 0) {
    throw new Error('La capacidad máxima del vehículo debe ser un valor positivo.');
  }
  if (data.consumo_combustible_litros !== undefined && data.consumo_combustible_litros <= 0) {
    throw new Error('El consumo de combustible debe ser un valor positivo.');
  }
  try {
    const vehiculoActualizado = await prisma.vehiculo.update({
      where: { id },
      data: {
        ...data,
        capacidad_max_m3: data.capacidad_max_m3 !== undefined ? data.capacidad_max_m3 : undefined,
        consumo_combustible_litros: data.consumo_combustible_litros !== undefined ? data.consumo_combustible_litros : undefined,
      },
    });
    return vehiculoActualizado;
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('matricula')) {
      throw new Error('Ya existe un vehículo con esta matrícula.');
    }
    console.error('Error al actualizar vehículo:', error);
    throw new Error('No se pudo actualizar el vehículo.');
  }
}

/**
 * Elimina un vehículo por su ID.
 * @param id ID del vehículo a eliminar.
 * @returns El vehículo eliminado.
 */
export async function eliminarVehiculo(id: bigint) {
  try {
    const vehiculoEliminado = await prisma.vehiculo.delete({
      where: { id },
    });
    return vehiculoEliminado;
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    throw new Error('No se pudo eliminar el vehículo.');
  }
}
