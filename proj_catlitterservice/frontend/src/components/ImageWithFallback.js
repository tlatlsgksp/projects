import React, { useState } from "react";

const ImageWithFallback = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const fallbackSrc = `${process.env.REACT_APP_API_URL}/static/uploads/default/default.png`;

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt || "image"}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
};

export default ImageWithFallback;