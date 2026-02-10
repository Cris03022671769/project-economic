// src/services/servicioRecogidaService.ts
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

// Definimos una interfaz para los datos de entrada del servicio
interface CreateServicioRecogidaData {
  clienteId: bigint;
  vehiculoId: bigint;
  trabajadorId: bigint;
  fecha: Date;
  volumen_recogido_m3: number; // Recibimos como number del frontend
}

/**
 * Crea un nuevo servicio de recogida, validando que el volumen no exceda la capacidad del vehículo.
 * El costo del servicio se calcula internamente.
 * @param data Datos para crear el servicio de recogida.
 * @returns El servicio de recogida creado.
 * @throws Error si el volumen recogido es inválido, el vehículo o cliente no existen, o el volumen excede la capacidad del vehículo.
 */
export async function crearServicioRecogida(data: CreateServicioRecogidaData): Promise<any> {
  const { clienteId, vehiculoId, trabajadorId, fecha, volumen_recogido_m3 } = data;

  // 1. Validar volumen_recogido_m3 (debe ser positivo)
  if (volumen_recogido_m3 <= 0) {
    throw new Error('El volumen recogido debe ser un valor positivo.');
  }

  // 2. Obtener la capacidad máxima del vehículo
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id: vehiculoId },
    select: { capacidad_max_m3: true }, // Solo necesitamos este campo
  });

  if (!vehiculo) {
    throw new Error(`Vehículo con ID ${vehiculoId} no encontrado.`);
  }

  // Convertir el volumen recogido a tipo Decimal de Prisma para la comparación
  const volumenRecogidoDecimal = new Prisma.Decimal(volumen_recogido_m3);

  // 3. Aplicar la regla de negocio: El volumen recogido nunca puede superar la capacidad del vehículo.
  if (volumenRecogidoDecimal.greaterThan(vehiculo.capacidad_max_m3)) {
    throw new Error(
      `El volumen recogido (${volumen_recogido_m3} m³) excede la capacidad máxima del vehículo (${vehiculo.capacidad_max_m3.toString()} m³).`
    );
  }

  // 4. Obtener la tarifa por m3 del cliente para calcular el costo del servicio
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { tarifa_por_m3: true },
  });

  if (!cliente) {
    throw new Error(`Cliente con ID ${clienteId} no encontrado.`);
  }

  // 5. Verificar que el trabajador exista
  const trabajador = await prisma.trabajador.findUnique({
    where: { id: trabajadorId },
    select: { id: true }, // Solo necesitamos verificar su existencia
  });

  if (!trabajador) {
    throw new Error(`Trabajador con ID ${trabajadorId} no encontrado.`);
  }

  // 6. Calcular el costo del servicio (Regla de negocio 2: El costo se calcula en el backend)
  // Asegúrate de que todas las operaciones monetarias usen el tipo Decimal de Prisma
  const costoServicio = volumenRecogidoDecimal.times(cliente.tarifa_por_m3).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP); // Redondeo a 2 decimales

  // 7. Crear el servicio de recogida en la base de datos
  try {
    const nuevoServicio = await prisma.servicioRecogida.create({
      data: {
        clienteId,
        vehiculoId,
        trabajadorId,
        fecha,
        volumen_recogido_m3: volumenRecogidoDecimal,
        costo_servicio: costoServicio,
      },
    });
    return nuevoServicio;
  } catch (dbError) {
    console.error('Error al guardar el servicio de recogida en la DB:', dbError);
    throw new Error('No se pudo crear el servicio de recogida debido a un error interno.');
  }
}

/**
 * Obtiene todos los servicios de recogida.
 * @returns Una lista de todos los servicios de recogida.
 */
export async function obtenerServiciosRecogida() {
  try {
    const servicios = await prisma.servicioRecogida.findMany({
      include: {
        cliente: true,
        vehiculo: true,
        trabajador: true,
      },
    });
    return servicios;
  } catch (error) {
    console.error('Error al obtener servicios de recogida:', error);
    throw new Error('No se pudieron obtener los servicios de recogida.');
  }
}

/**
 * Obtiene un servicio de recogida por su ID.
 * @param id ID del servicio de recogida.
 * @returns El servicio de recogida encontrado o null si no existe.
 */
export async function obtenerServicioRecogidaPorId(id: bigint) {
  try {
    const servicio = await prisma.servicioRecogida.findUnique({
      where: { id },
      include: {
        cliente: true,
        vehiculo: true,
        trabajador: true,
      },
    });
    return servicio;
  } catch (error) {
    console.error('Error al obtener servicio de recogida por ID:', error);
    throw new Error('No se pudo obtener el servicio de recogida.');
  }
}

/**
 * Actualiza un servicio de recogida existente.
 * @param id ID del servicio a actualizar.
 * @param data Objeto con los campos a actualizar.
 * @returns El servicio de recogida actualizado.
 * @throws Error si el volumen recogido es inválido, el vehículo o cliente no existen, o el volumen excede la capacidad del vehículo.
 */
export async function actualizarServicioRecogida(
  id: bigint,
  data: {
    clienteId?: bigint;
    vehiculoId?: bigint;
    trabajadorId?: bigint;
    fecha?: Date;
    volumen_recogido_m3?: number;
  }
) {
  const { clienteId, vehiculoId, trabajadorId, fecha, volumen_recogido_m3 } = data;

  // Obtener el servicio actual para comparar y obtener IDs si no se proporcionan
  const servicioExistente = await prisma.servicioRecogida.findUnique({
    where: { id },
    select: { clienteId: true, vehiculoId: true, trabajadorId: true, volumen_recogido_m3: true },
  });

  if (!servicioExistente) {
    throw new Error(`Servicio de recogida con ID ${id} no encontrado.`);
  }

  const finalClienteId = clienteId ?? servicioExistente.clienteId;
  const finalVehiculoId = vehiculoId ?? servicioExistente.vehiculoId;
  const finalTrabajadorId = trabajadorId ?? servicioExistente.trabajadorId;
  const finalVolumenRecogido = volumen_recogido_m3 ?? servicioExistente.volumen_recogido_m3.toNumber();

  // Validar volumen_recogido_m3 si se proporciona o si el existente es inválido
  if (finalVolumenRecogido <= 0) {
    throw new Error('El volumen recogido debe ser un valor positivo.');
  }

  // Obtener la capacidad máxima del vehículo (nuevo o existente)
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id: finalVehiculoId },
    select: { capacidad_max_m3: true },
  });

  if (!vehiculo) {
    throw new Error(`Vehículo con ID ${finalVehiculoId} no encontrado.`);
  }

  const volumenRecogidoDecimal = new Prisma.Decimal(finalVolumenRecogido);

  // Aplicar la regla de negocio: El volumen recogido nunca puede superar la capacidad del vehículo.
  if (volumenRecogidoDecimal.greaterThan(vehiculo.capacidad_max_m3)) {
    throw new Error(
      `El volumen recogido (${finalVolumenRecogido} m³) excede la capacidad máxima del vehículo (${vehiculo.capacidad_max_m3.toString()} m³).`
    );
  }

  // Obtener la tarifa por m3 del cliente (nuevo o existente)
  const cliente = await prisma.cliente.findUnique({
    where: { id: finalClienteId },
    select: { tarifa_por_m3: true },
  });

  if (!cliente) {
    throw new Error(`Cliente con ID ${finalClienteId} no encontrado.`);
  }

  // Verificar que el trabajador exista (nuevo o existente)
  const trabajador = await prisma.trabajador.findUnique({
    where: { id: finalTrabajadorId },
    select: { id: true },
  });

  if (!trabajador) {
    throw new Error(`Trabajador con ID ${finalTrabajadorId} no encontrado.`);
  }

  // Calcular el costo del servicio
  const costoServicio = volumenRecogidoDecimal.times(cliente.tarifa_por_m3).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  try {
    const servicioActualizado = await prisma.servicioRecogida.update({
      where: { id },
      data: {
        clienteId: finalClienteId,
        vehiculoId: finalVehiculoId,
        trabajadorId: finalTrabajadorId,
        fecha: fecha ?? undefined, // Si fecha no se proporciona, no se actualiza
        volumen_recogido_m3: volumenRecogidoDecimal,
        costo_servicio: costoServicio,
      },
    });
    return servicioActualizado;
  } catch (error) {
    console.error('Error al actualizar servicio de recogida:', error);
    throw new Error('No se pudo actualizar el servicio de recogida.');
  }
}

/**
 * Elimina un servicio de recogida por su ID.
 * @param id ID del servicio de recogida a eliminar.
 * @returns El servicio de recogida eliminado.
 */
export async function eliminarServicioRecogida(id: bigint) {
  try {
    const servicioEliminado = await prisma.servicioRecogida.delete({
      where: { id },
    });
    return servicioEliminado;
  } catch (error) {
    console.error('Error al eliminar servicio de recogida:', error);
    throw new Error('No se pudo eliminar el servicio de recogida.');
  }
}
