import { useState } from 'react';
import Editor from './Editor';        // Import Editor component
import FileUpload from './FileUpload'; // Import FileUpload component
import { Button } from "@/components/ui/button"; // Import Button component

export default function Post() {
    const [showComponents, setShowComponents] = useState(false);

    // Function to toggle the editor and uploader visibility
    const toggleVisibility = () => {
        setShowComponents((prev) => !prev);
    };

    return (
        <div>
            {/* Button to open/close the editor and file uploader */}
            <Button variant="outline" onClick={toggleVisibility}>
                {showComponents ? 'Close' : 'Add Post'}
            </Button>

            {showComponents && (
                <div>
                    {/* Editor Component */}
                    <Editor />

                    {/* FileUpload Component */}
                    <FileUpload onUpload={() => {}} />
                </div>
            )}
        </div>
    );
}