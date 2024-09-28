import fs from 'fs/promises';
const saveBookFromURL = async (url: string) => { 
    // Function to save a book from a URL
    const resp = await fetch(url);
    const buffer = await resp.arrayBuffer();
    const filename = url.split('/').pop();
    const file = `./tmp/${filename}_${Date.now()}`;
    await fs.writeFile(file, Buffer.from(buffer));
    return file;
}


export { saveBookFromURL };
