// pages/api/vehiculos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  crearVehiculo,
  obtenerVehiculos,
  obtenerVehiculoPorId,
  actualizarVehiculo,
  eliminarVehiculo,
} from '../../src/services/vehiculoService';
import { serializeBigInt } from '../../src/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (id) {
        const vehiculo = await obtenerVehiculoPorId(BigInt(id as string));
        if (vehiculo) {
          res.status(200).json(serializeBigInt(vehiculo));
        } else {
          res.status(404).json({ message: 'Vehículo no encontrado.' });
        }
      } else {
        const vehiculos = await obtenerVehiculos();
        res.status(200).json(serializeBigInt(vehiculos));
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { matricula, capacidad_max_m3, consumo_combustible_litros } = req.body;
      if (!matricula || capacidad_max_m3 === undefined || consumo_combustible_litros === undefined) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
      }
      const nuevoVehiculo = await crearVehiculo(
        matricula,
        parseFloat(capacidad_max_m3),
        parseFloat(consumo_combustible_litros)
      );
      res.status(201).json(serializeBigInt(nuevoVehiculo));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, matricula, capacidad_max_m3, consumo_combustible_litros } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'ID del vehículo es obligatorio para actualizar.' });
      }
      const updatedVehiculo = await actualizarVehiculo(
        BigInt(id as string),
        {
          matricula,
          capacidad_max_m3: capacidad_max_m3 !== undefined ? parseFloat(capacidad_max_m3) : undefined,
          consumo_combustible_litros: consumo_combustible_litros !== undefined ? parseFloat(consumo_combustible_litros) : undefined,
        }
      );
      res.status(200).json(serializeBigInt(updatedVehiculo));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'ID del vehículo es obligatorio para eliminar.' });
      }
      const deletedVehiculo = await eliminarVehiculo(BigInt(id as string));
      res.status(200).json(serializeBigInt(deletedVehiculo));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
