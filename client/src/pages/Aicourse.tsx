import React from 'react';
import Markdown from 'react-markdown';
const AiCourse = () => {
    return ( 
        <div className="">
            <h1 className="text-4xl text-center">React Course</h1>
            <div className="flex justify-center">
                <div className="w-1/2">
                    <Markdown>
                        {`## Hello World
                            This is a paragraph
                            `}
                    </Markdown>
                </div>
            </div>
            
        </div>
     );
}
 
export default AiCourse;