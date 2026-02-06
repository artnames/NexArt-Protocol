import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const CanonicalHead = () => {
  const location = useLocation();
  
  // Build canonical URL - ensure trailing slashes are handled consistently
  const path = location.pathname === "/" ? "" : location.pathname;
  const canonicalUrl = `https://nexart.io${path}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default CanonicalHead;
