import React from "react";

function Card({ title, children, buttonText, onButtonClick }) {
  return (
    <div className="card bg-base-300 rounded-box p-4 grow">
      <h2 className="font-bold text-lg mb-2">{title}</h2>
      <div className="flex-1 w-full">{children}</div>
      {buttonText && (
        <button className="btn btn-primary mt-4" onClick={onButtonClick}>
          {buttonText}
        </button>
      )}
    </div>
  );
}
export default Card;