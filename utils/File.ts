import log from 'encore.dev/log';
import fs from 'fs/promises';
const saveBookFromURL = async (url: string) => { 
    // Function to save a book from a URL
    log.info(`Saving file from ${url}`);
    const resp = await fetch(url);
    const buffer = await resp.arrayBuffer();
    const filename = url.split('/').pop();
    await fs.mkdir('./tmp', { recursive: true });
    const file = `./tmp/${filename}_${Date.now()}`;
    await fs.writeFile(file, Buffer.from(buffer));
    log.info(`Saved file from ${url} to ${file}`);
    return file;
}


export { saveBookFromURL };
