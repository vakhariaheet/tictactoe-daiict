import * as React from "react"
import { useState } from 'react'
import { useEffect } from 'react';


const PdfViewer: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
  useEffect(() => {
    
      if (window.AdobeDC) {
          const adobeDCView = new window.AdobeDC.View({
              clientId: "0a67f5baed2f41e08de932211687713b", // Replace with your Adobe API key
              divId: "adobe-dc-view" // The ID of the div where the PDF will be rendered
          });

          adobeDCView.previewFile({
              content: { location: { url: pdfUrl } }, // Replace with your PDF URL
              metaData: { fileName: "sample.pdf" } // Set the desired filename
          },
          {
              embedMode: "SIZED_CONTAINER", // Options: "FULL_WINDOW", "SIZED_CONTAINER", "IN_LINE"
              showDownloadPDF: false, // Hides the download button
              showPrintPDF: false, // Hides the print button
              showAnnotationTools: false, // Hides annotation tools
              showLeftHandPanel: false, // Hides the left-hand navigation panel
              showPageControls: false, // Hides page controls (previous, next)
              showZoomControl: false, // Hides zoom controls
              showFullScreen: false, // Hides the fullscreen button
              defaultViewMode: "FIT_WIDTH", // Options: "FIT_WIDTH", "FIT_PAGE"
          });
      }
  }, [pdfUrl]);

  return <div id="adobe-dc-view" style={{ height: '325px', width: '100%' }} />;
};

export default PdfViewer;
