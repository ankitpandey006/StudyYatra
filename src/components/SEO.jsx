import React from "react";

const SEO = ({ title, description, canonical }) => {
  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
    </>
  );
};

export default SEO;