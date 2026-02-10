// pages/api/servicios-recogida.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  crearServicioRecogida,
  obtenerServiciosRecogida,
  obtenerServicioRecogidaPorId,
  actualizarServicioRecogida,
  eliminarServicioRecogida,
} from '../../src/services/servicioRecogidaService';
import { serializeBigInt } from '../../src/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (id) {
        const servicio = await obtenerServicioRecogidaPorId(BigInt(id as string));
        if (servicio) {
          res.status(200).json(serializeBigInt(servicio));
        } else {
          res.status(404).json({ message: 'Servicio de recogida no encontrado.' });
        }
      } else {
        const servicios = await obtenerServiciosRecogida();
        res.status(200).json(serializeBigInt(servicios));
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { clienteId, vehiculoId, trabajadorId, fecha, volumen_recogido_m3 } = req.body;
      if (!clienteId || !vehiculoId || !trabajadorId || !fecha || volumen_recogido_m3 === undefined) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
      }
      const nuevoServicio = await crearServicioRecogida({
        clienteId: BigInt(clienteId),
        vehiculoId: BigInt(vehiculoId),
        trabajadorId: BigInt(trabajadorId),
        fecha: new Date(fecha),
        volumen_recogido_m3: parseFloat(volumen_recogido_m3),
      });
      res.status(201).json(serializeBigInt(nuevoServicio));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, clienteId, vehiculoId, trabajadorId, fecha, volumen_recogido_m3 } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'ID del servicio de recogida es obligatorio para actualizar.' });
      }
      const updatedServicio = await actualizarServicioRecogida(
        BigInt(id as string),
        {
          clienteId: clienteId ? BigInt(clienteId) : undefined,
          vehiculoId: vehiculoId ? BigInt(vehiculoId) : undefined,
          trabajadorId: trabajadorId ? BigInt(trabajadorId) : undefined,
          fecha: fecha ? new Date(fecha) : undefined,
          volumen_recogido_m3: volumen_recogido_m3 !== undefined ? parseFloat(volumen_recogido_m3) : undefined,
        }
      );
      res.status(200).json(serializeBigInt(updatedServicio));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'ID del servicio de recogida es obligatorio para eliminar.' });
      }
      const deletedServicio = await eliminarServicioRecogida(BigInt(id as string));
      res.status(200).json(serializeBigInt(deletedServicio));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
