import { Prisma, PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';
import asyncMiddleware from '../middleware/async';

const prisma = new PrismaClient();
const app = express();

app.get(
  '/collections',
  asyncMiddleware(async (req: Request, res: Response) => {
    const collections = await prisma.superfastCollection.findMany();

    res.json({
      collections: collections.flatMap((collection) => ({
        ...collection,
      })),
    });
  })
);

app.post(
  '/collections',
  asyncMiddleware(async (req: Request, res: Response) => {
    const data: Prisma.SuperfastCollectionCreateInput = req.body;
    const collection = await prisma.$transaction(async (prisma) => {
      await prisma.$queryRawUnsafe(
        `CREATE TABLE ${req.body.collection}(id integer NOT NULL PRIMARY KEY)`
      );
      return await prisma.superfastCollection.create({ data });
    });

    res.json({ collection: collection });
  })
);

app.delete(
  '/collections/:id',
  asyncMiddleware(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const meta = await prisma.superfastCollection.findUnique({ where: { id: id } });

    await prisma.$transaction(async (prisma) => {
      await prisma.$queryRawUnsafe(`DROP TABLE ${meta.collection}`);
      await prisma.superfastCollection.delete({ where: { collection: meta.collection } });
    });

    res.status(204).end();
  })
);

export default app;
