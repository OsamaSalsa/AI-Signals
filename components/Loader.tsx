import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="w-6 h-6 border-4 border-t-accent border-r-accent border-card/50 dark:border-dark-card/50 rounded-full animate-spin"></div>
  );
};

export default React.memo(Loader);