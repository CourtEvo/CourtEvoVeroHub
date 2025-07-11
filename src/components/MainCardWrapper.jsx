// components/MainCardWrapper.jsx
import React from "react";
import AlertsBanner from "./AlertsBanner";

export default function MainCardWrapper({ children }) {
  return (
    <div
      style={{
        maxWidth: 1450,
        margin: "40px auto 0 auto",
        padding: "40px 32px 40px 32px",
        background: "rgba(35,41,47,0.92)",
        borderRadius: 38,
        boxShadow: "0 8px 60px #232a2e44",
        minHeight: "85vh",
        position: "relative",
      }}
    >
      <AlertsBanner />
      {children}
    </div>
  );
}
