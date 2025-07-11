import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Splash = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'linear-gradient(135deg, #283E51 0%, #485563 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <img src="/logo.png" alt="CourtEvo Vero" style={{ width: 120, marginBottom: 24 }} />
        <div style={{ fontSize: 38, fontWeight: 900, color: '#FFD700', letterSpacing: 2, marginBottom: 8 }}>
          COURTEVO VERO
        </div>
        <div style={{ fontSize: 20, color: '#fff', marginBottom: 24 }}>
          Be Real. Be Vero.
        </div>
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ color: '#FFD700', fontWeight: 600, fontSize: 22 }}
        >
          Loading...
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Splash;
