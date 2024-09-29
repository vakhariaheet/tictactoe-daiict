import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './ui/button';
pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.mjs';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
const Demo = () => {
	const [numPages, setNumPages] = useState(1);
	const [pageNumber, setPageNumber] = useState(1);
	return (
		<div className='flex flex-col items-center justify-center w-max relative'>
			<Document
                file='https://res.cloudinary.com/hzxyensd5/image/upload/w_150,c_scale/v1727505965/doc_codepen_upload/CG_UNIT_1_ASS._psa7nn.pdf'
                onLoadSuccess={(pdf) => {
                    setNumPages(pdf.numPages)
                }}
                
                
			>
				<Page height={300} pageNumber={pageNumber} />
            </Document>
            <div className="absolute opacity-15 hover:opacity-75 gap-3 flex bottom-0 justify-center w-full z-[9999]">
                <Button onClick={() => setPageNumber(pageNumber > 1 ? pageNumber - 1:1)}>
                    {'<'}
                </Button>
                <Button onClick={() => setPageNumber(pageNumber < numPages ? pageNumber + 1:pageNumber)}>
                    {'>'}
                </Button>
            </div> 
		</div>
	);
};

export default Demo;
