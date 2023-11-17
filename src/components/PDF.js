import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import * as pdfjs from 'pdfjs-dist/webpack';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import path from '../pdf/doc.pdf';

const PdfCarousel = () => {
  const [pdfImages, setPdfImages] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const convertPdfToImages = async () => {
    try {
      const pdfDoc = await pdfjs.getDocument(path).promise;
      const numPages = pdfDoc.numPages;
      const images = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const image = canvas.toDataURL('image/png');
        images.push(image);
      }

      setPdfImages(images);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  

  useEffect(() => {
    convertPdfToImages();
  }, []); // Run once when the component mounts

  const openLightbox = (index) => {
    convertPdfToImages();
    setPhotoIndex(index);
    setIsOpen(true);
  };

  
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          vertical: false,
          verticalSwiping: false,
        },
      },
    ],
    appendDots: (dots) => (
      <div style={{ maxWidth: '450px', maxHeight: '400px', overflow: 'hidden' }}>
        {dots.slice(0, 5)}
      </div>
    ),
    afterChange: (currentSlide, nextSlide) => {
      if (nextSlide === pdfImages.length - 1) {
        setTimeout(() => {
          openLightbox(0);
          Slider.slickGoTo(0);
        }, 0);
      }
    },
  };

  return (
    <div className="pdf-carousel-container">
      <Slider {...settings}>
        {pdfImages.map((image, index) => (
          <div key={index} className="pdf-carousel-slide" onClick={() => openLightbox(index)}>
            <img src={image} alt={`Page ${index + 1}`} />
          </div>
        ))}
      </Slider>

      {isOpen && pdfImages.length > 0 && (
        <Lightbox
          mainSrc={pdfImages[photoIndex]}
          nextSrc={pdfImages[(photoIndex + 1) % pdfImages.length]}
          prevSrc={pdfImages[(photoIndex + pdfImages.length - 1) % pdfImages.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + pdfImages.length - 1) % pdfImages.length)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % pdfImages.length)}
        />
      )}
    </div>
  );
};

export default PdfCarousel;


