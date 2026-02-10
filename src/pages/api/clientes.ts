// pages/api/clientes.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
} from '@/services/clienteService';
import { ClienteTipo } from '@prisma/client';
import { serializeBigInt } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (id) {
        const cliente = await obtenerClientePorId(BigInt(id as string));
        if (cliente) {
          res.status(200).json(serializeBigInt(cliente));
        } else {
          res.status(404).json({ message: 'Cliente no encontrado.' });
        }
      } else {
        const clientes = await obtenerClientes();
        res.status(200).json(serializeBigInt(clientes));
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, tipo, direccion, tarifa_por_m3 } = req.body;
      if (!nombre || !tipo || !direccion || tarifa_por_m3 === undefined) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
      }
      const nuevoCliente = await crearCliente(
        nombre,
        tipo as ClienteTipo,
        direccion,
        parseFloat(tarifa_por_m3)
      );
      res.status(201).json(serializeBigInt(nuevoCliente));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, nombre, tipo, direccion, tarifa_por_m3 } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'ID del cliente es obligatorio para actualizar.' });
      }
      const updatedCliente = await actualizarCliente(
        BigInt(id as string),
        {
          nombre,
          tipo: tipo as ClienteTipo,
          direccion,
          tarifa_por_m3: tarifa_por_m3 !== undefined ? parseFloat(tarifa_por_m3) : undefined,
        }
      );
      res.status(200).json(serializeBigInt(updatedCliente));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'ID del cliente es obligatorio para eliminar.' });
      }
      const deletedCliente = await eliminarCliente(BigInt(id as string));
      res.status(200).json(serializeBigInt(deletedCliente));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
