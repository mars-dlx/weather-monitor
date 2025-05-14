import path from 'path';
import fs from 'fs';
import type { Request, Response } from 'express';

const version = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../version.json'), {
    encoding: 'utf8',
  }),
);

export function getHealth(_req: Request, res: Response) {
  res.status(200).json({ ...version, status: 'ok' });
}
