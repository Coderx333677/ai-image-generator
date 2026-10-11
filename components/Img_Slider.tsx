"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules'; // 1. Import modules

// 2. Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ImgSlider() {
  const images = [
    "/slider-pics/ai-creative-gallery.png",
    "/slider-pics/ai-image-generation.png",
    "/slider-pics/ai-robot-artist.png",
    "/slider-pics/ai-sunset-landscape.png",
  ];

  return (
    // 3. Wrapper div controls the size (h-64 means 256px tall)
    <div className="h-full w-full max-w-2xl mx-auto h-64 rounded-xl overflow-hidden relative">
      <Swiper
        // 4. Add the modules here
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        navigation // Adds left/right arrows
        pagination={{ clickable: true }} // Adds clickable dots at the bottom
        autoplay={{ delay: 3000, disableOnInteraction: false }} // Auto-slides every 3 seconds
        className="w-full h-full" // 5. Use h-full so it fills the wrapper div
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={img}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}