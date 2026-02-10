// src/lib/utils.ts

/**
 * Convierte un objeto que puede contener BigInts a un formato JSON-serializable,
 * transformando los BigInts a strings.
 * Útil para serializar respuestas de API que contienen IDs de Prisma (BigInt).
 * @param obj El objeto a serializar.
 * @returns Un objeto con BigInts convertidos a strings.
 */
export function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}
