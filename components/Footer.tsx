import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-8 px-4 text-xs text-text-muted dark:text-dark-text-muted space-y-4">
      <div className="space-y-1">
        <p className="font-semibold text-text-main dark:text-dark-text-main">Ai Signals Intelligent Risk Control Center</p>
        <p>Global intelligent trading ecosystem, help you rationally deal with every fluctuation in the market!</p>
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-text-main dark:text-dark-text-main">Disclaimer:</p>
        <p className="max-w-3xl mx-auto">
          All content provided in this app is for learning and reference purposes only and does not constitute any investment advice or trading guidelines. Users should make their own judgement and bear the risks arising from the use of the content.
        </p>
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-text-main dark:text-dark-text-main">© {new Date().getFullYear()} Osama Salsa. All rights reserved.</p>  
        </div>
    </footer>
  );
};

export default React.memo(Footer);