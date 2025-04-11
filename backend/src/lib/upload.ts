import { writeFile } from 'fs/promises';
import { join } from 'path';

export const uploadFile = async (file: File) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const randomString = crypto.randomUUID();
  const fileName = `${randomString.slice(0, 10)}.${file.name.split('.')[1]}`;

  const path = join('./', 'public', fileName);

  await writeFile(path, buffer);

  return { fileName: `/${fileName}` };
};
