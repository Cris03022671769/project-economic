// pages/api/trabajadores.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  crearTrabajador,
  obtenerTrabajadores,
  obtenerTrabajadorPorId,
  actualizarTrabajador,
  eliminarTrabajador,
} from '@/services/trabajadorService';
import { serializeBigInt } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (id) {
        const trabajador = await obtenerTrabajadorPorId(BigInt(id as string));
        if (trabajador) {
          res.status(200).json(serializeBigInt(trabajador));
        } else {
          res.status(404).json({ message: 'Trabajador no encontrado.' });
        }
      } else {
        const trabajadores = await obtenerTrabajadores();
        res.status(200).json(serializeBigInt(trabajadores));
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, rol, salario_base } = req.body;
      if (!nombre || !rol || salario_base === undefined) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
      }
      const nuevoTrabajador = await crearTrabajador(
        nombre,
        rol,
        parseFloat(salario_base)
      );
      res.status(201).json(serializeBigInt(nuevoTrabajador));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, nombre, rol, salario_base } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'ID del trabajador es obligatorio para actualizar.' });
      }
      const updatedTrabajador = await actualizarTrabajador(
        BigInt(id as string),
        {
          nombre,
          rol,
          salario_base: salario_base !== undefined ? parseFloat(salario_base) : undefined,
        }
      );
      res.status(200).json(serializeBigInt(updatedTrabajador));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'ID del trabajador es obligatorio para eliminar.' });
      }
      const deletedTrabajador = await eliminarTrabajador(BigInt(id as string));
      res.status(200).json(serializeBigInt(deletedTrabajador));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
